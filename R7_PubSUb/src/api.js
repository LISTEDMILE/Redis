import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

//dekho seedhi si bat h ek publisher hota h ek reciever aur beech me redis

// publisher koi bhi event publish karega jaise notification

// aise hi hm create karte h subscribers ye sunte rehte h kab event publish hota fir kuch fn hote jaise ki on message return karega channel aur message callback....

//basically hmne publisher.publish karke ek event publish kiya
// subscriber always listening for the events publish hote hi usne listen karke ab yha hmne publish event ka nam notifications to notifications wale ne listen kar liye aur run ho gya

// reveivers const publish hi kar rha h name ko utna nhi serius lo

const publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.post("/notifications", async (req, res) => {
    const payload = {
        title: req.body.title || "Default Title",
        createdAt: new Date().toISOString(),
    };
    const receivers = await publisher.publish(
        "notifications",
        JSON.stringify(payload),
    );
    res.json({ message: `Notification sent to ${receivers} subscribers` });
});

app.listen(3000, () => {
    console.log("API server is running on port http://localhost:3000");
});
