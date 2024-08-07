const { Client, Entity, Schema, Repository } = require("redis-om");
const connectRedis = require("../config/redis");
const { createClient } = require("redis");

const excFn = async () => {
  let playerRepository;
  try {
    // const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

    // // /* create and open the Redis OM Client */
    // const client = await new Client().open(url);
    // // const client = await connectRedis()

    //----------------------
    let redis = createClient({ url: "redis://103.252.72.185:6380" });
    redis.on("error", async (err) => {
      console.log("Redis Client Error", err.message);
      // setTimeout(async () => {
      //   redis = createClient({ url: process.env.REDIS_URL });
      //   await redis.connect();
      // }, 5000);
    });
    redis.on("connect", () => {
    });
    await redis.connect();
    //------------------------------

    // class Player extends Entity {}

    const playerSchema = new Schema("Player", {
      ready: { type: "boolean" },
      roomId: { type: "string" },
      point: { type: "number" },
      name: { type: "string" },
      token: { type: "string" },
      beAttacked: { type: "number" },
      socketId: { type: "string" },
      no: { type: "number" },
    });
    // playerRepository = client.fetchRepository(playerSchema);
    playerRepository = new Repository(playerSchema, redis);
    // playerRepository = redis.fetchRepository(playerSchema);
    await playerRepository.createIndex();
    return playerRepository;
  } catch (error) {
    console.log("Lỗi ở player model: " + error.message);
  } finally {
    return playerRepository;
  }
};
module.exports = excFn;
