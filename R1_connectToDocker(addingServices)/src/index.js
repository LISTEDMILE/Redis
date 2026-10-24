import express from "express";
import Redis from "ioredis";
import mongoose from "mongoose";

const app = express();

// we create redis instance
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// redis.ping shows the status if working it send pong for ping
app.get("/redis", async (req, res) => {
    const reply = await redis.ping();
    res.json({ redis: reply });
});

app.get("/mongo", async (req, res) => {
    const url =
        process.env.MONGO_URL || "mongodb://localhost:27017/MongoRedisDatabase";

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(url);
    }
    res.json({ mongo: "connected", database: mongoose.connection.name });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
