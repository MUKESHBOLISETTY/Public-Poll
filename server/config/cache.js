import { Redis } from 'ioredis'
import { Queue } from 'bullmq';
import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { processVote } from '../utils/voteQueue.js';
dotenv.config();

export const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
});

export const redisPub = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
});

export const redisSub = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
});

//Bullmq
export const voteQueue = new Queue('voteQueue', {
    connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: null
    }
});

export const voteWorker = new Worker(
    'voteQueue',
    processVote,
    {
        connection: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD,
            maxRetriesPerRequest: null
        },
        limiter: {
            max: 1,
            duration: 500
        }
    }
);

redisClient.on('error', (err) => {
    const failureTime = new Date().toISOString();
    console.warn(`[${failureTime}] Failed to connect to Redis on startup, continuing without caching...`);
});

redisClient.on('connect', () => {
    console.log('Successfully connected and authenticated to Redis!');
});
