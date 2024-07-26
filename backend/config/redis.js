const { createClient } = require("redis");
let client = null;
const connectRedis = async () => {
  client = createClient({ url: process.env.REDIS_URL });

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();
  console.log("Connected to Redis!");
};
const getClient = () => {
  if (client) {
    return client;
  } else {
    console.error("Not connect to Redis!");
  }
};
module.exports = {
  connectRedis,
  getClient,
};
//------------------
// // import { Client } from 'redis-om'

// // /* pulls the Redis URL from .env */
// // const url = process.env.REDIS_URL

// // /* create and open the Redis OM Client */
// // const client = await new Client().open(url)

// // export default client
// const { createClient } = require("redis");

// await console.log('a')
