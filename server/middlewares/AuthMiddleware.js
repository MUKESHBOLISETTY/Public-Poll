import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/User.js";

dotenv.config();

class AuthMiddleware {

    async authenticateUser(req, res, next) {
        try {
            const token = req.params.token || req.header("Authorization").replace("Bearer ", "");
            if (!token) {
                return res.status(401).json({ success: false, message: "Access denied. No token provided." });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded?.email || !decoded?.sessionId || !decoded) {
                return res.status(401).json({ success: false, message: "Invalid token." });
            }
            const user = await User.findOne({ email: decoded.email, sessionId: decoded.sessionId }).select("-password");
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }
            req.user = user;
            next();
        } catch (error) {
            console.error("Authentication error:", error);
            res.status(401).json({ success: false, message: "Unauthorized access." });
        }
    }
}

export default new AuthMiddleware();