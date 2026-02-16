import { redisClient } from "../config/cache.js";
import { Poll } from "../models/Poll.js";

class DbSyncer {

    constructor() {
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log("DB Syncer Service Started");

        this.syncVotesToDatabase();

        setInterval(() => {
            this.syncVotesToDatabase();
        }, 10000);
    }

    async syncVotesToDatabase() {
        const bufferKey = 'poll:buffer';
        const processingKey = 'poll:buffer:processing';

        try {
            const exists = await redisClient.exists(bufferKey);
            if (!exists) return;

            await redisClient.rename(bufferKey, processingKey);
            const pendingUpdates = await redisClient.hgetall(processingKey);

            const bulkOps = [];
            for (const [key, count] of Object.entries(pendingUpdates)) {
                const [pollId, optionId] = key.split(':');
                bulkOps.push({
                    updateOne: {
                        filter: { _id: pollId, "question.options._id": optionId },
                        update: { $inc: { "question.options.$.voteCount": parseInt(count), "totalVotes": parseInt(count) } },
                    }
                });

            }

            if (bulkOps.length > 0) {
                await Poll.bulkWrite(bulkOps, { ordered: false });
                console.log(`Synced ${bulkOps.length} updates to MongoDB.`);
            }

            await redisClient.del(processingKey);
        } catch (error) {
            if (error.message && error.message.includes('no such key')) return;
            console.error("Database Sync Error:", error.message);

            try {
                const failedVotes = await redisClient.hgetall(processingKey);
                if (Object.keys(failedVotes).length > 0) {
                    const pipeline = redisClient.pipeline();
                    for (const [key, count] of Object.entries(failedVotes)) {
                        pipeline.hincrby(bufferKey, key, parseInt(count));
                    }
                    await pipeline.exec();
                    console.log(`Recovered ${Object.keys(failedVotes).length} failed batches back to buffer.`);
                }
                await redisClient.del(processingKey);
            } catch (mergeError) {
                console.error("CRITICAL: Failed to recover votes:", mergeError);
            }
        }
    }
}

const dbSyncer = new DbSyncer();
export default dbSyncer;