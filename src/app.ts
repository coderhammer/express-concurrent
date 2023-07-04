import express, { Request, Response } from "express";

const app = express();

const queue: { req: Request; res: Response }[] = [];

const running = new Set<{ req: Request; res: Response }>();

const maxConcurrentRequests = 2;

const handler = async (req: Request, res: Response) => {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  console.log("handling request!");
  res.send("ok");
};

const processQueue = async () => {
  console.log("processing queue");
  if (!queue.length) {
    console.log("queue is empty");
    return;
  }
  if (running.size >= maxConcurrentRequests) {
    console.log("queue is full, will handle later");
    return;
  }
  const tuppleToProcess = queue.shift();
  running.add(tuppleToProcess);
  await handler(tuppleToProcess.req, tuppleToProcess.res);
  running.delete(tuppleToProcess);
  return processQueue();
};

app.get("/", async (req: Request, res: Response) => {
  queue.push({ req, res });
  processQueue();
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
