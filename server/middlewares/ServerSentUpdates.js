import RedisUpdates from './Publisher.js'
import AuthController from '../controllers/AuthController.js';
import { redisSub } from '../config/cache.js';
import PollController from '../controllers/PollController.js';

class ServerSentUpdates {
    constructor() {
        this.users = new Map();
        this.public_users = new Map();
    }

    init() {
        if (this.initialized) return;
        this.initializeSubscriber();
        this.initialized = true;
    }

    initializeSubscriber() {
        const channels = ["user_update", "poll_votes_update"];

        channels.forEach(channel => {
            redisSub.subscribe(channel, (err) => {
                if (err) console.error(`Redis subscribe error [${channel}]:`, err);
            });
        });

        redisSub.on("message", (channel, message) => {
            const data = JSON.parse(message);
            if (channel === "user_update") this.#handleUserBroadcast(data);
            if (channel === "poll_votes_update") this.#handlePollVoteBroadcast(data);
        });
    }

    #handleUserBroadcast({ email, updatedUser }) {
        const clients = this.users.get(email?.toLowerCase());
        if (clients) {
            clients.forEach(res => this.#emit(res, 'user_update', updatedUser));
        }
    }
    #handlePollVoteBroadcast({ pollId, updatedPollData }) {
        const clients = this.public_users.get(pollId);
        if (clients) {
            clients.forEach(res => this.#emit(res, 'poll_votes_update', updatedPollData));
        }
    }

    #setSSEHeaders(res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
    }

    #emit(res, event, data) {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
    #emit_error(res, event, message, code) {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify({ message, code })}\n\n`);
    }

    async getUser(req, res) {
        try {
            const email = req.params.email;
            this.#setSSEHeaders(res);

            const initialUserData = await AuthController.getUserData(email);
            if (!initialUserData) {
                throw new Error("USER_NOT_FOUND");
            }

            if (!this.users.has(email)) {
                this.users.set(email, new Set());
            }
            this.users.get(email).add(res);

            this.#emit(res, 'initial_user_data', initialUserData);

            const heartbeatInterval = setInterval(() => {
                res.write(`event: keep-alive\n\n`);
            }, 30000);

            req.on("close", () => {
                clearInterval(heartbeatInterval);
                const set = this.users.get(email);
                if (set) {
                    set.delete(res);
                    if (set.size === 0) {
                        this.users.delete(email);
                    }
                }
                console.log(`SSE client for ${email} disconnected. (getUser)`);
            });

        } catch (error) {
            if (!res.headersSent) {
                return res.status(500).json({ success: false, message: 'Failed to establish SSE connection.' });
            } else {
                this.#emit_error(res, 'error', 'Failed to retrieve initial user data.', 'INITIAL_DATA_ERROR');
                res.end();
            }
        }
    }

    async sendUserUpdater(email) {
        try {
            const updatedUser = await AuthController.getUserData(email, true);
            if (!updatedUser) return;
            await RedisUpdates.publishUserUpdate(email, updatedUser);
        } catch (error) {
            console.error("sendUserUpdater error:", error);
        }
    }
    async getVotes(req, res) {
        try {
            const pollId = req.params.pollId;
            this.#setSSEHeaders(res);

            const initialPollData = await PollController.getAllPollResults(pollId);
            if (!initialPollData) {
                throw new Error("POLL_NOT_FOUND");
            }

            if (!this.public_users.has(pollId)) {
                this.public_users.set(pollId, new Set());
            }
            this.public_users.get(pollId).add(res);

            this.#emit(res, 'initial_vote_data', initialPollData);

            const heartbeatInterval = setInterval(() => {
                res.write(`event: keep-alive\n\n`);
            }, 30000);

            req.on("close", () => {
                clearInterval(heartbeatInterval);
                const set = this.public_users.get(pollId);
                if (set) {
                    set.delete(res);
                    if (set.size === 0) {
                        this.public_users.delete(pollId);
                    }
                }
                console.log(`SSE client for ${pollId} disconnected. (getPolls)`);
            });

        } catch (error) {
            if (!res.headersSent) {
                return res.status(500).json({ success: false, message: 'Failed to establish SSE connection.' });
            } else {
                this.#emit_error(res, 'error', 'Failed to retrieve initial poll data.', 'INITIAL_DATA_ERROR');
                res.end();
            }
        }
    }

    async sendPollVoteUpdater(pollId) {
        try {
            const updatedPollData = await PollController.getAllPollResults(pollId);
            if (!updatedPollData) return;
            await RedisUpdates.publishPollVotesUpdate(pollId, updatedPollData);
        } catch (error) {
            console.error("send Poll Vote Updater error:", error);
        }
    }
}
export default new ServerSentUpdates();