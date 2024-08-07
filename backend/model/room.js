const { Client, Entity, Schema, Repository } = require("redis-om");
const connectRedis = require("../config/redis");
const { createClient } = require("redis");

const excFn = async () => {
  let roomRepository;
  try {
    const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

    // /* create and open the Redis OM Client */
    // const client = await new Client().open(url);
    // const client = await connectRedis()

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

    // class Room extends Entity {}

    const roomSchema = new Schema("Room", {
      name: { type: "string" },
      numberOfRoom: { type: "number" },
      capacity: { type: "number" },
      isStart: { type: "boolean" },
      isEnd: { type: "boolean" },
      createdAt: { type: "date" },
      turn: { type: "number" },
      ratio: { type: "number" },
    });
    // roomRepository = redis.fetchRepository(roomSchema);
    roomRepository = new Repository(roomSchema, redis);
    await roomRepository.createIndex();
    return roomRepository;
  } catch (error) {
    console.log('Lỗi khi create room: ', + error.message);
  } finally {
    return roomRepository;
  }
};
module.exports = excFn;
