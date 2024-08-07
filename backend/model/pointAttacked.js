const { Client, Entity, Schema, Repository } = require("redis-om");
const connectRedis = require("../config/redis");
const { createClient } = require("redis");

const excFn = async () => {
  let pointAttackedReposistory;
  try {
    const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

    // /* create and open the Redis OM Client */
    // const client = await new Client().open(url);
    // const client = await connectRedis()
    //

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
    // ------
    // class Point extends Entity {}

    const pointAttacked = new Schema("Point", {
      x: { type: "number" },
      y: { type: "number" },
      isAttacked: { type: "boolean" },
      roomId: { type: "string" },
      playerId: { type: "string" }, // id người có tọa độ tại điểm này
      attackedId: { type: "string" }, // id người đã tấn công điểm này
    });
    // pointAttackedReposistory = redis.fetchRepository(pointAttacked);
    pointAttackedReposistory = new Repository(pointAttacked, redis);

    await pointAttackedReposistory.createIndex(); //only once time
    // console.log(JSON.stringify(pointAttackedReposistory))
    // console.log('rs: ' + JSON.stringify(rs))
    return pointAttackedReposistory;
  } catch (error) {
    console.log("Lỗi ở create point (model): " + error.message);
  } finally {
    return pointAttackedReposistory;
  }
};
// const createIndexPoint = async () => {
//   try {
//     const pointAttackedReposistory = await excFn();
//     await pointAttackedReposistory.createIndex();
//   } catch (error) {
//     console.log("Lỗi khi create Index Point: " + error.message);
//   }
// };
// createIndexPoint();
module.exports = excFn;
