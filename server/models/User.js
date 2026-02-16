import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        role: {
            type: String,
            enum: ['ADMIN'],
            default: 'ADMIN',
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        sessionId: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            required: true,
            default: false,
        },
        polls: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Poll",
            }
        ]
    },
    {
        timestamps: true,
    }
);

UserSchema.index({ fullName: 1 });
UserSchema.index({ role: 1 });

export const User = mongoose.model("User", UserSchema);