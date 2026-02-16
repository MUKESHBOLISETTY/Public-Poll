import { voteQueue } from "../config/cache.js";
import PollController from "../controllers/PollController.js";
import ServerSentUpdates from "../middlewares/ServerSentUpdates.js";
export const queuePoll = async (pollId, optionId, userIp) => {
    await voteQueue.add('add-vote', { pollId, optionId, userIp },
        {
            priority: 1,
            removeOnComplete: true,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 400,
            }
        });
}

export const processVote = async (job) => {
    const { pollId, optionId, userIp } = job.data;

    console.log(`[Job ${job.id}] Processing vote to: ${pollId}`);

    try {
        await PollController.updateVoteToCache(pollId, optionId, userIp)
    } catch (error) {
        console.error(`Error in job ${job.id}:`, error);
        throw error;
    }
};

