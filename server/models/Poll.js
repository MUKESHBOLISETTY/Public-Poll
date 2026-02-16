import mongoose from 'mongoose';

const PollSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        slug: { type: String, required: true },
        question: {
            questionText: { type: String, required: true },
            options: [{
                option: { type: String, required: true },
                voteCount: { type: Number, required: true, default: 0 },
            }],
        },
        totalVotes: { type: Number, required: true, default: 0 },
    },
    {
        timestamps: true,
    }
);


export const Poll = mongoose.model("Poll", PollSchema);