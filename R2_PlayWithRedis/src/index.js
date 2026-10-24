import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// can use camel case or _ or anything but generally in redis we use like this
const BANNER_KEY = "app:banner";

app.get("/redis", async (req, res) => {
    const reply = await redis.ping();
    res.json({ redis: reply });
});

app.post("/banner", async (req, res) => {
    await redis.set(BANNER_KEY, req.body.message || "Welcome");
    res.json({ success: true });
});

app.get("/banner", async (req, res) => {
    const message = await redis.get(BANNER_KEY);
    res.json({ message });
});

app.delete("/banner", async (req, res) => {
    await redis.del(BANNER_KEY);
    res.json({ success: true });
});

app.get("/banner/exists", async (req, res) => {
    const exists = await redis.exists(BANNER_KEY);
    res.json({ exists: Boolean(exists) });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
