import { useEffect, useState } from "react";
// import { IoMdClose } from "react-icons/io";
import Player from "../component/Player";
import { useNavigate, useParams } from "react-router-dom";
import { apiGetPoint } from "../api/point";
import Swal from "sweetalert2";
import lostImg from "../assets/img/lost.jpg";
import LeaderBoard from "../component/LeaderBoard";
import { apiGetRoom } from "../api/Room";
import Cell from "../component/Cell";
const Playing = ({ socket }) => {
  const [matrix, setMatrix] = useState(null);
  // const matrix = useRef(null);
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [nameTurn, setNameTurn] = useState("");
  const [render, setRender] = useState(true);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [points, setPoints] = useState([]);
  const [pointFire, setPointFire] = useState([]); // điểm tấn công trúng và bị cháy
  const [size, setSize] = useState(null);
  const [ratio, setRatio] = useState(0);
  
  const { id } = useParams();
  const getPoint = async () => {
    const points = await apiGetPoint({
      token: localStorage.getItem("token"),
      roomId: id,
    });
    if (points.success) {
      setPoints((prev) => [...prev, ...points.mes]);
    }
  };
  const getRoom = async () => {
    const fetchRoom = await apiGetRoom({ id });
    setMatrix(() => {
      // tạo mảng 2 chiều
      const ratio = fetchRoom.message.ratio;
      let matrix = new Array(ratio);
      for (let i = 0; i < matrix.length; i++) {
        matrix[i] = new Array(ratio);
      }
      // điền giá trị 0 vào tất cả
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          matrix[i][j] = false;
        }
      }
      // console.log('matrix: ' + JSON.stringify(matrix[5]))
      return matrix;
    });
    // if (fetchRoom?.message.ratio === 32) setRatio(5);
    // else {
    //   console.log("haha");
    // }
    setRatio(fetchRoom?.message.ratio);
  };
  // Get room and ratio and initialize matrix
  useEffect(() => {
    getRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (socket) {
      
      socket.on("connect", () => {
        let socketId = socket.id;
        const data = {
          token: localStorage.getItem("token"),
          socketId: socketId,
        };
        socket.emit("visited", data);
      });
      socket.on("error", (data) => {
        navigate("/");
      });
      socket.emit(
        "joinRoom",
        {
          roomId: id,
          token: localStorage.getItem("token"),
        },
        (rs) => {
          if (rs === "success") {
            socket.emit("playing", { roomId: id });
          }
        }
      );
      socket.on("getPlayers", (data) => {
        if (data.success) {
          setPlayers(data.mes);
        }
      });

      socket.on("myTurn", () => {
        setIsMyTurn(true);
      });
      socket.on("notificationTurn", (data) => {
        if (data.token === localStorage.getItem("token")) {
          setIsMyTurn(true);
          setNameTurn("Bạn");
        } else {
          setNameTurn(data.name);
        }
      });

      socket.on("endGame", (data) => {
        // Swal.fire({
        //   title: "Do you want to save the changes?",
        //   showDenyButton: true,
        //   showCancelButton: true,
        //   confirmButtonText: "Save",
        //   denyButtonText: `Don't save`,
        // }).then((result) => {
        //   /* Read more about isConfirmed, isDenied below */
        //   if (result.isConfirmed) {
        //     Swal.fire("Saved!", "", "success");
        //   } else if (result.isDenied) {
        //     Swal.fire("Changes are not saved", "", "info");
        //   }
        // });
        notiEndGame(data);
      });
      socket.on("lostGame", () => {
        notiLostGame();
      });
    }
    return () => {
      socket.off("error");
      socket.off("endGame");
      socket.off("lostGame");
      socket.off("myTurn");
      socket.off("getPlayers");
      socket.off("rsKick");
      socket.off("notificationTurn");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleKick = (i, j) => {
    if (
      isMyTurn &&
      matrix[i][j] !== true &&
      !points.find((el) => el.x === i && el.y === j)
    ) {
      setMatrix(() => {
        const newMatrix = matrix;
        newMatrix[i][j] = true;
        return newMatrix;
      });
      setRender(!render);
      setIsMyTurn(false);
      socket.emit("kick", {
        x: i,
        y: j,
        roomId: id,
        token: localStorage.getItem("token"),
      });
    }
  };
  const hitPoint = (i, j) => {
    setMatrix(() => {
      const newMatrix = matrix;
      newMatrix[i][j] = true;
      return newMatrix;
    });
    setRender(!render);
  };
  useEffect(() => {
    // ---------------
    if (ratio !== 0) {
      setSize(Math.round(640 / ratio));
      getPoint();
      socket.on("pointActtacked", (data) => {
        data.forEach((el) => {
          hitPoint(el.x, el.y);

          if (el.playerId !== "") {
            const { x, y } = el;
            setPointFire((prev) => [...prev, { x, y }]);
          }
        });
      });
      socket.on("rsKick", (data) => {
        const { x, y, success, notification, endGame } = data;
        hitPoint(x, y);
        if (success) {
          setPointFire((prev) => [...prev, { x, y }]);
        }
        if (notification && !endGame) {
          // Swal.fire({
          //   position: "top-end",
          //   icon: "info",
          //   title: notification,
          //   showConfirmButton: false,
          //   timer: 1500,
          // });
        }
      });
      return () => {
        socket.off("pointActtacked");
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matrix]);

  const notiLostGame = () => {
    Swal.fire({
      title: "Bạn đã thua cuộc!",
      imageUrl: lostImg,
      imageWidth: 400,
      imageAlt: "Custom image",
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/");
      } else if (result.dismiss) {
        console.log("dismiss");
      }
      // else {
      //   navigate("/");
      // }
    });
  };
  const notiEndGame = (data) => {
    Swal.fire({
      title: "hihi",
      timerProgressBar: 2000,
    });
    Swal.fire({
      title: "Game Over!",
      text: `Chúc mừng ${
        data?.token === localStorage.getItem("token") && "bạn"
      } chiến thắng trận này!`,
      showConfirmButton: true,
      confirmButtonText: "Quay về trang chủ",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/");
      } else if (result.dismiss) {
        console.log("dismiss");
      }
      // else {
      //   navigate("/");
      // }
    });
  };
  const handleSurrender = () => {
    socket.emit("leaveRoom", {
      roomId: id,
      token: localStorage.getItem("token"),
    });
    // handleReady(false);
    navigate("/");
  };
  return (
    <div className="bgPlaying">
      <div className="flex justify-around py-4">
        <div
          className={`hover:text-red-500 text-white hover:underline cursor-pointer max-w-[300px] min-w-[250px]`}
          onClick={() => {
            handleSurrender();
          }}
        >
          Xin hàng (thoát)
        </div>
        <div>
          <div className="flex gap-6 justify-center p-5">
            {players?.map((item, index) => {
              return <Player name={item.name} ready={item.ready} key={index} />;
            })}
          </div>
        </div>
        {/* <div className="min-w-[250px]">Tới lượt: {nameTurn}</div> */}
        <LeaderBoard className="max-w-[300px] min-w-[250px]" data={players} />
      </div>
      <div className="text-center font-bold">Tới lượt: {nameTurn}</div>

      <div>
        <table className="mx-auto bg-slate-400/30 backdrop:blur-xl">
          {matrix?.map((item, index) => {
            return (
              <tr key={index}>
                {item.map((el, idx) => {
                  const fire = pointFire.find(
                    (el) => el.x === index && el.y === idx
                  );
                  return Cell({
                    el,
                    fire,
                    points,
                    index,
                    idx,
                    handleKick,
                    ratio,
                    size,
                  });
                })}
              </tr>
            );
          })}
        </table>
      </div>
    </div>
  );
};

export default Playing;
