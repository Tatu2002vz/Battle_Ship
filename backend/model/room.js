const { Client, Entity, Schema, Repository } = require("redis-om");

const excFn = async () => {
  const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

  /* create and open the Redis OM Client */
  const client = await new Client().open(url);

  class Room extends Entity {}

  const roomSchema = new Schema(Room, {
    name: { type: "string" },
    numberOfRoom: { type: "number" },
    capacity: { type: "number" },
    isStart: { type: "boolean" },
    isEnd: { type: "boolean" },
    createdAt: { type: "date" },
    turn: { type: "number" },
  });
  const roomRepository = client.fetchRepository(roomSchema);
  await roomRepository.createIndex();
  return roomRepository;
};
module.exports = excFn;
