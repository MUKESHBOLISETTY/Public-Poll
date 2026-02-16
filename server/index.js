import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { connect } from './config/database.js';
import dotenv from "dotenv"
import cluster from 'cluster';
import os from 'os';
import helmet from 'helmet';
import userRoutes from './routes/AuthRoutes.js';
import pollRoutes from './routes/PollRoutes.js';
import ServerSentUpdates from './middlewares/ServerSentUpdates.js';
import dbSyncer from './utils/DbSyncer.js';
dotenv.config()

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
    console.log(`Master process ${process.pid} is running`);

    for (let i = 0; i < 1; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });

} else {
    const app = express();
    const port = process.env.port || 5000;

    connect();
    ServerSentUpdates.init();
    dbSyncer.start();
    app.use(express.json());
    app.use(cookieParser());

    app.use(helmet());

    const corsoptions = {
        origin: process.env.origin,
        methods: "GET, POST, PUT, DELETE, HEAD, PATCH",
        credentials: true,
    }
    app.use(cors(corsoptions));
    app.set('trust proxy', 'loopback')

    app.use("/api/v1/auth", userRoutes);
    app.use("/api/v1/poll", pollRoutes);

    app.get('/', (req, res) => {
        return res.json({
            success: true,
            message: "Your server is up and running",
        });
    });

    app.listen(port, () => {
        console.log(`Worker ${process.pid} is listening on port ${port}.`);
    });
}