// const { Client, Entity, Schema, Repository } = require("redis-om");

// const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

//     /* create and open the Redis OM Client */
// const client = await new Client("redis://103.252.72.210:26379").open(url);

const { createClient } = require("redis");
const { Client, Entity, Schema, Repository } = require("redis-om");

// await client.sendCommand(['HGETALL', 'key']); // ['key1', 'field1', 'key2', 'field2']

const connectRedis = async () => {
  const sentinelClient = await createClient({ url: "redis://103.252.72.210:26379" })
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

  const rs = await sentinelClient.sendCommand([
    "SENTINEL",
    "get-master-addr-by-name",
    "mymaster",
  ]); // 'OK'
  // console.log(JSON.stringify(rs[0]));
  // console.log(JSON.stringify(rs[1]));
  // const client = await createClient({url: `redis://${rs[0]}:${rs[1]}`})
  const url = `redis://${rs[0]}:${rs[1]}`
  const client = await new Client().open(url);
  return client;
};
// connectRedis();
module.exports = connectRedis;
