import { respond } from "../utils/respond.js";
import { User } from '../models/User.js';
import dotenv from "dotenv"
import mongoose from "mongoose";
import { redisClient } from "../config/cache.js";
import { generateSlug } from "../utils/generateSlug.js";
import { Poll } from "../models/Poll.js";
import { queuePoll } from "../utils/voteQueue.js";
import ServerSentUpdates from "../middlewares/ServerSentUpdates.js";
dotenv.config()
class PollController {
    #_hasPermission(user) {
        if (user?.role !== "ADMIN") return false;
        return true;
    }
    async createPoll(req, res) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            if (!this.#_hasPermission(req?.user)) {
                await session.abortTransaction();
                return respond(res, "Permission Denied", 403, false);
            }

            const { question, options } = req.body;
            if (!question || !options) {
                await session.abortTransaction();
                return respond(res, "All fields are required", 400, false);
            }
            if (question.length > 50) {
                await session.abortTransaction();
                return respond(res, "Question is too long.", 400, false);
            }
            if (options.length < 2) {
                await session.abortTransaction();
                return respond(res, "There must be more than one option", 400, false);
            }
            const allowedFields = ['option'];
            const hasUnknownFields = req.body.options.some(item => {
                const receivedFields = Object.keys(item);
                return receivedFields.some(field => !allowedFields.includes(field));
            });

            if (hasUnknownFields) {
                await session.abortTransaction();
                return respond(res, "Denied", 400, false);
            }
            const slug = await generateSlug(Poll, question);
            const [newPoll] = await Poll.create([{
                user: req.user._id,
                question: {
                    questionText: question,
                    options
                },
                slug
            }], { session });

            await User.findByIdAndUpdate(req.user._id, {
                $push: { polls: newPoll._id },
            }, { session });
            await session.commitTransaction();
            return respond(res, "poll_created", 201, true);
        } catch (error) {
            await session.abortTransaction();
            return respond(res, "Error Occured", 500, false);
        } finally {
            await session.endSession();
        }
    }

    async getPoll(req, res) {
        try {
            const { pollId } = req.params;
            if (!pollId) {
                return respond(res, "Missing Poll ID", 400, false);
            }
            const poll = await Poll.findOne({ _id: pollId }).select("-question.options.voteCount -slug -user");
            if (!poll) {
                return respond(res, "Poll not found", 404, false);
            }
            return respond(res, "Poll fetched successfully", 200, true, poll);
        } catch (error) {
            console.error(error);
            return respond(res, "Error fetching poll", 500, false);
        }
    }

    async votePoll(req, res) {
        try {
            const { pollId } = req.params;
            const { optionId, userIp } = req.body;
            // const userIp = req.ip || req.headers['x-forwarded-for'];
            if (!pollId || !optionId) {
                return respond(res, "Missing Poll ID or Option ID", 400, false);
            }
            const lockKey = `lock:poll:${pollId}:ip:${userIp}`;
            const alreadyVoted = await redisClient.get(lockKey);

            if (alreadyVoted) {
                return respond(res, "Vote already recorded from this IP", 429, false);
            }
            await queuePoll(pollId, optionId, userIp);
            await redisClient.set(lockKey, '1', 'EX', 600);

            return respond(res, "Response Saved", 200, true);
        } catch (error) {
            console.error(error);
            return respond(res, "Error voting poll", 500, false);
        }
    }

    async updateVoteToCache(pollId, optionId, userIp) {
        try {
            const totalKey = `poll:${pollId}:total`;
            const bufferKey = `poll:buffer`;
            const lockKey = `lock:poll:${pollId}:ip:${userIp}`;

            await redisClient.multi()
                .hincrby(totalKey, optionId, 1)
                .hincrby(bufferKey, `${pollId}:${optionId}`, 1)
                .set(lockKey, "1", "EX", 600)
                .exec();

            await ServerSentUpdates.sendPollVoteUpdater(pollId);
        } catch (error) {
            throw error;
        }
    }

    async getAllPollResults(pollId) {
        try {
            const CACHE_TTL_SECONDS = 600;
            const cacheKey = `poll:${pollId}:total`;

            let cachedData = await redisClient.hgetall(cacheKey);

            if (Object.keys(cachedData).length > 0) {
                const parsedData = {};
                for (const [key, value] of Object.entries(cachedData)) {
                    parsedData[key] = parseInt(value, 10);
                }
                return parsedData;
            }

            console.warn(`Cache miss for ${pollId}, fetching from DB`);

            if (mongoose.connection.readyState !== 1) {
                throw new Error("Worker Database not connected");
            }

            const poll = await Poll.findOne({ _id: pollId }).lean();
            if (!poll) throw new Error("Poll not found");

            const resultsMap = {};
            poll.question.options.forEach(opt => {
                resultsMap[opt._id.toString()] = opt.voteCount || 0;
            });

            if (Object.keys(resultsMap).length > 0) {
                await redisClient.hmset(cacheKey, resultsMap);
                await redisClient.expire(cacheKey, CACHE_TTL_SECONDS);
            }

            return resultsMap;

        } catch (err) {
            console.error(`Result Fetch Error:`, err);
            throw err;
        }
    }

    async getAllPolls(req, res) {
        try {
            if (!this.#_hasPermission(req?.user)) {
                return respond(res, "Permission Denied", 403, false);
            }
            let { page: pageParam, limit: limitParam, search = "" } = req.query;
            const page = parseInt(pageParam) || 1;
            const limit = parseInt(limitParam) || 10;

            if (page < 1 || limit < 1) {
                return respond(res, "Page and limit must be positive numbers", 400, false);
            }
            const matchStage = {};
            if (search) {
                matchStage.$or = [
                    { "question.questionText": { $regex: search, $options: "i" } },
                    { slug: { $regex: search, $options: "i" } },
                ];
            }
            const pipeline = [
                { $match: matchStage },
                { $sort: { "createdAt": -1 } },
                {
                    $facet: {
                        data: [
                            { $skip: (page - 1) * limit },
                            { $limit: limit },
                            {
                                $project: {
                                    slug: 1,
                                    user: 1,
                                    totalVotes: 1,
                                    question: 1,
                                    createdAt: 1,
                                    updatedAt: 1,
                                }
                            }
                        ],
                        count: [
                            { $count: "total" }
                        ]
                    }
                }
            ];

            const result = await Poll.aggregate(pipeline);
            const payload = result[0]?.data || [];
            const total = result[0]?.count[0]?.total || 0;

            const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
            res.json({
                payload,
                message: "polls_received",
                currentPage: page,
                totalPages: totalPages,
                totalItems: total
            });

        } catch (err) {
            console.error(`Result Fetch Error:`, err);
            throw err;
        }
    }

}
export default new PollController();
