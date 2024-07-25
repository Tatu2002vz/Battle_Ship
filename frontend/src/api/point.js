import axios from "../axios";

export const apiGetPoint = ({ token, roomId }) =>
  axios({
    url: "api/point",
    method: "POST",
    data: {
      token,
      roomId,
    },
  });
