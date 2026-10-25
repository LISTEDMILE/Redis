import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const QUEUE_KEY = "queue:emails";

// lpush -> left me push
// rpop -> right se pop

app.post("/emails", async (req, res) => {
    const job = {
        to: req.body.to,
        subject: req.body.subject || "No subject",
        createdAt: new Date().toISOString(),
        body: req.body.body || "No content",
    };

    await redis.lpush(QUEUE_KEY, JSON.stringify(job));
    res.json({ queue: true, job });
});

app.get('/emails/process-one', async (req, res) => {
    const rawjob = await redis.rpop(QUEUE_KEY);
    if (!rawjob) {
        return res.json({ message: "No jobs in the queue" });
    }

    const job = JSON.parse(rawJob);
    res.json({ message: "Email sent", job });
})