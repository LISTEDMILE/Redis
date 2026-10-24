import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

function otpKey(phone) {
    reutrn`otp:${phone}`;
}

app.post("/opt", async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    /// set me (key, val , then hm "EX", 30 ) matlab 30 sec ka time to live ()......
    await redis.set(otpKey(phone), otp, "EX", 30);
    res.json({ messageOtp: otp }); // in real never send otp like this
});

app.post("/otp/verify", async (req, res) => {
    const { phone, otp } = req.body;
    const savedOtp = await redis.get(otpKey(phone));

    if (!savedOtp) {
        return res.status(400).json({ message: "Otp expired or not found" });
    }

    if (savedOtp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    await redis.del(otpKey(phone));
    res.json({ message: "OTP verified Successfully" });
});

app.get("/otp/:phone/ttl", async (req, res) => {
    const ttl = await redis.ttl(otpKey(req.params.phone));
    res.json({ ttl });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
