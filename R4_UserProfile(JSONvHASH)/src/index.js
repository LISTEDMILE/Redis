import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");


// there are two methods to store data in hash one is set and hset
// set me data string me save hota h hset me object to set me seedha delete karna padega hset me changes kar skte h

// :json doesn't do anything its just a convention to show what type or whatever its included in the string

// some more func -> hset hget hdel hexists
app.post("/user/:id/json", async (req, res) => {
    await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body));

    res.json({ savedAs: "json" });
});

app.get("/user/:id/json", async (req, res) => {
    const raw = await redis.get(`user:${req.params.id}:json`);
    res.json({ user: raw ? JSON.parse(raw) : null });
});

app.post("/user/:id/hash", async (req, res) => {
    await redis.hset(`user:${req.params.id}:hash`, req.body);
    res.json({ savedAs: "hash" });
});

app.get("/user/:id/hash", async (req, res) => {
    const user = await redis.hgetall(`user:${req.params.id}:hash`);
    res.json({ user });
})

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
