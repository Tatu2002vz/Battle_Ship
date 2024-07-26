const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/db");
const initRoutes = require("./route");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");

const { createServer } = require("http");
const socketModule = require("./module/socket");
const { connectRedis } = require("./config/redis");
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
const port = process.env.PORT;
app.use("/images", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
    origin: "*",
  })
);
dbConnect();
connectRedis();
initRoutes(app);
const server = createServer(app);

socketModule(server);



//-------------------------------------
server.listen(port, () => {
  console.log("Server listening on port: " + port);
});
