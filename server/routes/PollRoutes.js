import express from "express";
import ServerSentUpdates from '../middlewares/ServerSentUpdates.js';
import { rateLimit } from 'express-rate-limit'
import AuthMiddleware from '../middlewares/AuthMiddleware.js'
import PollController from "../controllers/PollController.js";
const router = express.Router();
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
})

const bind = (method) => method.bind(PollController);
const ssebind = (method) => method.bind(ServerSentUpdates);

router.post("/votePoll/:pollId", limiter, bind(PollController.votePoll));

router.get("/getVotes/:pollId", limiter, ssebind(ServerSentUpdates.getVotes));

router.get("/getPoll/:pollId", limiter, bind(PollController.getPoll));

router.use(AuthMiddleware.authenticateUser);

router.post("/createPoll", limiter, bind(PollController.createPoll));

router.get("/getAllPolls", limiter, bind(PollController.getAllPolls));

export default router;