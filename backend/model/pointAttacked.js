const { Entity, Schema } = require("redis-om");
const connectRedis = require("../config/redis");

// Repository được tạo 1 lần duy nhất và dùng lại (singleton).
let repositoryPromise = null;

const getPointRepository = () => {
  if (!repositoryPromise) {
    repositoryPromise = (async () => {
      const client = await connectRedis();

      class Point extends Entity {}

      const pointSchema = new Schema(Point, {
        x: { type: "number" },
        y: { type: "number" },
        isAttacked: { type: "boolean" },
        roomId: { type: "string" },
        playerId: { type: "string" }, // token của người có tàu tại điểm này ("" = ô trống)
        attackedId: { type: "string" }, // token của người đã bắn điểm này ("" = chưa ai bắn)
      });

      const repository = client.fetchRepository(pointSchema);
      await repository.createIndex();
      return repository;
    })().catch((err) => {
      repositoryPromise = null;
      throw err;
    });
  }
  return repositoryPromise;
};

module.exports = getPointRepository;
