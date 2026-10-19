// Redis client dùng chung cho toàn bộ backend (singleton).
// Trước đây mỗi lần gọi model lại mở 1 kết nối Redis mới + createIndex() mới,
// gây chậm và rò kết nối. Nay client chỉ được tạo 1 lần duy nhất.
//
// Cấu hình qua .env (xem .env.example):
// - REDIS_URL: dùng trực tiếp, mặc định redis://127.0.0.1:6379
// - Hoặc Redis Sentinel: REDIS_SENTINEL_HOST / REDIS_SENTINEL_PORT / REDIS_SENTINEL_MASTER
const { createClient } = require("redis");
const { Client } = require("redis-om");

let clientPromise = null;

const openClient = async () => {
  if (process.env.REDIS_SENTINEL_HOST) {
    const sentinel = createClient({
      url: `redis://${process.env.REDIS_SENTINEL_HOST}:${
        process.env.REDIS_SENTINEL_PORT || 26379
      }`,
    });
    sentinel.on("error", (err) => console.log("Redis Sentinel Error", err));
    await sentinel.connect();
    const master = await sentinel.sendCommand([
      "SENTINEL",
      "get-master-addr-by-name",
      process.env.REDIS_SENTINEL_MASTER || "mymaster",
    ]);
    await sentinel.quit().catch(() => {});
    return new Client().open(`redis://${master[0]}:${master[1]}`);
  }
  const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  return new Client().open(url);
};

const connectRedis = () => {
  if (!clientPromise) {
    clientPromise = openClient().catch((err) => {
      // Cho phép thử lại ở lần gọi sau nếu kết nối đầu thất bại
      clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
};

module.exports = connectRedis;
