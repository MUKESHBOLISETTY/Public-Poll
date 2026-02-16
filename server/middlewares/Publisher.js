import { redisPub } from "../config/cache.js";

class RedisUpdates {
    async publishUserUpdate(email, updatedUser) {
        await redisPub.publish("user_update", JSON.stringify({ email, updatedUser }));
    }
    async publishPollVotesUpdate(pollId, updatedPollData) {
        await redisPub.publish("poll_votes_update", JSON.stringify({ pollId, updatedPollData }));
    }
}
export default new RedisUpdates();