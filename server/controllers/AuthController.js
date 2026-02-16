import { respond } from "../utils/respond.js";
import { User } from '../models/User.js';
import bcrypt from "bcrypt";
import uniqid from 'uniqid';
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import mongoose from "mongoose";
import { redisClient } from "../config/cache.js";
dotenv.config()
class AuthController {

    async #tokenGenerator(email, sessionId) {
        const payload = {
            email,
            sessionId
        };
        const newtoken = jwt.sign(payload, process.env.JWT_SECRET);
        return newtoken;
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return respond(res, "All fields are required", 400, false);
            }
            const loweredemail = email.trim().toLowerCase()
            const UserSchema = await User.findOne({ email: loweredemail }).select("email token password verified");
            if (!UserSchema) {
                return respond(res, "Invalid User Details!", 400, false);
            } else if (UserSchema?.verified !== true) {
                return respond(res, "Verification Required", 400, false, null, "VERIFICATION_REQUIRED");
            } else {
                if (await bcrypt.compare(password, UserSchema.password)) {
                    const { password, ...userWithoutPassword } = UserSchema.toObject();
                    const userResponse = userWithoutPassword
                    return respond(res, "userlogin", 200, true, userResponse);
                } else {
                    return respond(res, "Email or Password Incorrect!", 400, false);
                }
            }
        } catch (error) {
            return respond(res, "Error Occured", 500, false);
        }
    }

    async usersignup(req, res) {
        try {
            const { fullName, email, password } = req.body;
            const allowedFields = ['fullName', 'email', 'password'];
            const receivedFields = Object.keys(req.body);
            const unknownFields = receivedFields.filter(field => !allowedFields.includes(field));

            if (unknownFields.length > 0) {
                return respond(res, "Denied", 400, false);
            }
            if (!fullName || !email || !password) {
                return respond(res, "All fields are required", 400, false);
            }

            if (password.length < 8) {
                return respond(res, "Password must be at least 8 characters long", 400, false);
            }

            const mail = email.trim().toLowerCase()
            const [existingEmail] = await Promise.all([
                User.findOne({ email: mail }).select("_id"),
            ]);

            if (existingEmail) return respond(res, "Email already exists", 400, false);

            const hashedPassword = await bcrypt.hash(password, 10);
            const uid = uniqid()
            const freshtoken = await this.#tokenGenerator(mail, uid)

            await User.create({
                token: freshtoken, sessionId: uid, fullName, email: mail, password: hashedPassword, verified: true
            })
            return respond(res, "user_registered", 200, true);

        } catch (error) {
            console.log(error)
            return respond(res, "User cannot be registered. Please try again", 500, false);
        }
    }

    async getUserData(email, update = false) {
        try {
            const CACHE_TTL_SECONDS = 600;
            const cacheKey = `user:${email}`;

            if (!update) {
                try {
                    let cachedData = await redisClient.get(cacheKey);
                    if (cachedData) {
                        return JSON.parse(cachedData);
                    }
                } catch (error) {
                    console.warn(`Redis GET failed for ${email}, falling back to DB:`, error.message);
                }
            }

            await redisClient.del(cacheKey).catch(() => { });
            const user = await User.findOne({ email, verified: true }).select("-password -token -forgottoken").lean();
            if (user?.verified !== true || !user) {
                throw new Error("User not found");
            } else {
                try {
                    await redisClient.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(user));
                } catch (error) {
                    console.warn(`Redis SET failed for ${email}:`, error.message);
                }
                return user;
            }
        } catch (err) {
            console.log(err)
        }
    }
}

export default new AuthController();