import { formatDate } from "./helpers.js";

await new Promise((resolve) => setTimeout(resolve, 1000));

console.log("hello world!", formatDate(new Date()));
