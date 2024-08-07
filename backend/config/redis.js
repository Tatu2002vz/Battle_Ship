require("dotenv").config();
const { createClient } = require("redis");

const abc = async () => {
  try {
    console.log(process.env.REDIS_URL);
    let redis = createClient({ url: "redis://103.252.72.185:6380" });
    redis.on("error", async (err) => {
      // setTimeout(async () => {
      //   redis = createClient({ url: process.env.REDIS_URL });
      //   await redis.connect();
      // }, 5000);
    });
    redis.on("connect", () => {
    });
    await redis.connect();
  } catch (error) {
    console.log("error connect: " + error.message);
  }
};

abc();
