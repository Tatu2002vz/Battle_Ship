const { Client, Entity, Schema, Repository } = require("redis-om");

const excFn = async () => {
  let roomRepository;
  try {
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
      ratio: { type: "number" },
    });
    roomRepository = client.fetchRepository(roomSchema);
    await roomRepository.createIndex();
    return roomRepository;
  } catch (error) {
    console.log('Lỗi khi create room: ', + error.message);
  } finally {
    return roomRepository;
  }
};
module.exports = excFn;
