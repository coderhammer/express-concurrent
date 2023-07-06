# Express Concurrent

This package allows you to control the number of concurrent requests being handled by an express application.

While Express and nodeJS in general is capable of handling a large number of requests in parallel, sometimes it's not quite the thing you want.

When a 5000 requests spike comes in and you're allocating a lot of memory in your application, if you're running on a small server, you will face out of memory errors.

This package is for you. You just need to set a maximum concurrent requests, and the rest of the requests will be queued and processed when needed if it reaches the limit.

## Installation

```
npm install @hammerbot/express-concurrent
```

## Usage

```ts
import express from 'express'
import {concurrent} from '@hammerbot/express-concurrent'

const app = express()

app.use(concurrent({
  max: 100
}))

app.get('/', (req, res) => {
  // Insert some heavy memory processing here
  res.send('ok')
})

app.listen(3000)
```
