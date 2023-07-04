import { test } from "node:test";
import { beforeEach } from "node:test";
import { strict as assert } from "node:assert";
import * as request from "supertest";

import * as express from "express";
import { NextFunction, Request, Response, Express } from "express";
import { concurrent } from "../express.middleware";

let app: Express;

beforeEach(() => {
  app = express();
});

test("it should process a request", async () => {
  app.use(
    concurrent({
      max: 2,
    })
  );

  app.get("/", async (req: Request, res: Response) => {
    res.send({
      foo: "bar",
    });
  });

  const response = await request(app).get("/").send();

  assert.equal(response.body.foo, "bar");
});

test("it should process a maximum of one request at a time", async () => {
  app.use(
    concurrent({
      max: 1,
    })
  );

  let i = 0;

  app.get("/", async (req: Request, res: Response) => {
    i++;
    assert.equal(i, 1);
    await new Promise((resolve) => setTimeout(resolve, 5));
    assert.equal(i, 1);
    i--;
    res.send({
      foo: "bar",
    });
  });

  const r = request(app);

  await Promise.all([
    r.get("/").send().expect(200),
    r.get("/").send().expect(200),
  ]);
});

test("it should be able to process two requests at the same time", async () => {
  app.use(
    concurrent({
      max: 2,
    })
  );

  let i = 0;
  let j = 0;
  app.get("/", async (req: Request, res: Response) => {
    i++;
    j++;
    if (j === 2) {
      assert.equal(i, 2);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    i--;
    res.send({
      foo: "bar",
    });
  });

  const r = request(app);

  await Promise.all([
    r.get("/").send().expect(200),
    r.get("/").send().expect(200),
    r.get("/").send().expect(200),
  ]);
});
