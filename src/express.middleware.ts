import type { NextFunction, Request, Response } from "express";

export const concurrent = (options: { max: number }) => {
  if (options.max < 1) {
    throw new TypeError(
      "Maximum concurrent requests must be greater or equal than 1"
    );
  }

  const queue: NextFunction[] = [];

  const running = new Set<NextFunction>();

  const maxConcurrentRequests = options.max;

  const processQueue = () => {
    if (!queue.length) {
      // queue is empty, we stop processing.
      return;
    }
    if (running.size >= maxConcurrentRequests) {
      // running requests have reach maximum, we delay processing.
      return;
    }
    const next = queue.shift() as NextFunction;
    running.add(next);
    next();
  };

  const queueMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    req.on("close", () => {
      // The request is closed. Either it responded or timed out.
      running.delete(next);
      processQueue();
    });
    queue.push(next);
    processQueue();
  };

  return queueMiddleware;
};
