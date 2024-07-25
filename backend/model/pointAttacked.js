const { Client, Entity, Schema, Repository } = require("redis-om");

const excFn = async () => {
  const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

  /* create and open the Redis OM Client */
  const client = await new Client().open(url);

  class Point extends Entity {}

  const pointAttacked = new Schema(Point, {
    x: { type: "number" },
    y: { type: "number" },
    isAttacked: { type: "boolean" },
    roomId: { type: "string" },
    playerId: { type: "string" }, // id người có tọa độ tại điểm này
    attackedId: { type: "string" }, // id người đã tấn công điểm này
  });
  const pointAttackedReposistory = client.fetchRepository(pointAttacked);
  await pointAttackedReposistory.createIndex();
  return pointAttackedReposistory;
};
module.exports = excFn;
