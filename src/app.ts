import express, { NextFunction, Request, Response } from "express";

const app = express();

const createMiddleware = (options: { maxConcurrentRequests: number }) => {
  const queue: NextFunction[] = [];

  const running = new Set<NextFunction>();

  const maxConcurrentRequests = options.maxConcurrentRequests;

  const processQueue = () => {
    if (!queue.length) {
      console.log("Queue is empty.");
      return;
    }
    if (running.size >= maxConcurrentRequests) {
      console.log(
        `Running a maximum of ${maxConcurrentRequests}, will handle later`
      );
      return;
    }
    const next = queue.shift();
    running.add(next);
    next();
  };

  const queueMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    req.on("close", () => {
      console.log("the request is over.");
      running.delete(next);
      processQueue();
    });
    queue.push(next);
    processQueue();
  };

  return queueMiddleware;
};

app.use(
  createMiddleware({
    maxConcurrentRequests: 2,
  })
);

app.get("/", async (req: Request, res: Response) => {
  req.setTimeout(10000);
  await new Promise((resolve) => setTimeout(resolve, 20000));
  console.log("handling request!");
  res.send("ok");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
