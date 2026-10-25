import express from "express";
import { emailQueue } from "./queue.js";

const app = express();
app.use(express.json());

// kisi bhi kam ko agar queue karna ho like 4 user ne request kari aur 3 worker h matlab  3 resource ya jha server run kar rha process aisa kuch to q req to fail kar jaegi

// uske liye queue me rakh dete h rear wala implement hota rhega enter front se hoga

// sabse pehle bullmq package install kiya its a tool to implement queue

//queue bnane ke liye see queue.js
// woker bnane ke liye see worker.js
//

app.post("/welcome-email", async (req, res) => {
    // emailQueue.add(name, { details },{configurations like kitne attempts backoff : matlab ek req fail hui to kitne time me start kare  kis tarah aur })

    const job = emailQueue.add(
        "send-welcome-email",
        {
            to: req.body.to,
            name: req.body.name || "Learner",
        },
        {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        },
    );
    res.json({
        message: "Welcome email job added to the queue!",
        jobId: job.id,
    });
});

app.listen(3000, () => {
    console.log("Server is running on port http://localhost:3000");
});
