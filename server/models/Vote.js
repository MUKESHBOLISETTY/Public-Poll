import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema(
    {
        pollId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Poll",
        },
        voterHash: { type: String, required: true },
        optionId: { type: String, required: true }
    },
    {
        timestamps: true,
    }
);


export const Vote = mongoose.model("Vote", VoteSchema);