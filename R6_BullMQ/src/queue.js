import { Queue } from "bullmq";

export const connection = {
    host: "localhost",
    port: 6379,
};

// this is the syntax we use new Queue(name of queue, { connection detail  isme host and port })

export const emailQueue = new Queue("emails", { connection });
