const roomRouter = require("./room");
const pointRouter = require("./point");

// const paymentRouter = require("./payment");
// const insertRouter = require("./insertData");
// const { notFound, errHandler } = require("../middlewares/errHandler");
// const { verifyAccessTokenoken } = require("../middlewares/verifyToken");

const initRoutes = (app) => {
  app.use("/api/room", roomRouter);
  app.use("/api/point", pointRouter);

  // app.use("/api/insert", insertRouter);

  //   app.use(notFound);
  //   app.use(errHandler);
};
module.exports = initRoutes;
