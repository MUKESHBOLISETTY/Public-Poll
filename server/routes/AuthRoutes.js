import express from "express";
import AuthController from '../controllers/AuthController.js';
import ServerSentUpdates from '../middlewares/ServerSentUpdates.js';
import { rateLimit } from 'express-rate-limit'
import AuthMiddleware from '../middlewares/AuthMiddleware.js'
const router = express.Router();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
})

const bind = (method) => method.bind(AuthController);
const ssebind = (method) => method.bind(ServerSentUpdates);

router.post("/login", limiter, bind(AuthController.login));

router.post("/signup", limiter, bind(AuthController.usersignup));

router.get("/getUser/:token/:email", (req, res, next) => AuthMiddleware.authenticateUser(req, res, next), ssebind(ServerSentUpdates.getUser));

router.use(AuthMiddleware.authenticateUser);

export default router;