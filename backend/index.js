const express = require("express");
require("dotenv").config();
const initRoutes = require("./route");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { createServer } = require("http");
const socketModule = require("./module/socket");
const connectRedis = require("./config/redis");

const app = express();
const port = process.env.PORT || 8888;

// CORS: chỉ cho phép các origin trong CLIENT_URL (phân tách bằng dấu phẩy).
// Khi chưa cấu hình CLIENT_URL (chạy local) thì phản chiếu origin của request.
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : true;
app.use(cors({ credentials: true, origin: clientOrigins }));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static("public"));

initRoutes(app);

const server = createServer(app);
socketModule(server);

// Chờ Redis sẵn sàng rồi mới nhận request.
// Đã bỏ MongoDB: không model nào dùng Mongo, toàn bộ dữ liệu nằm ở Redis.
(async () => {
  try {
    await connectRedis();
    console.log("Redis connected");
  } catch (error) {
    console.log("Redis connection error: " + error.message);
  }
  server.listen(port, () => {
    console.log("Server listening on port: " + port);
  });
})();
