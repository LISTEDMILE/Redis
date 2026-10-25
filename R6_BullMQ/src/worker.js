import { Worker } from "bullmq";
import { connection } from "./queue";

// to create worker we use new Worker ( name of worker, callback fn jo job ka object return karega , connection details with port and host )

// it gives many events two of which are

// on completed and on failed see syntax below
const worker = new Worker(
    "emails",
    async (Job) => {
        console.log("Processing email job...", Job.id, Job.name, Job.data);
        await new Promise((resolve) => setTimeout(resolve, 1500));
    },

    { connection },
);

worker.on("completed", (Job) => {
    console.log("JOb completed", Job.id, Job.name, Job.data);
});

worker.on("failed", (job, err) => {
    console.log("Job failed", job.id, job.name, job.data, err);
});
