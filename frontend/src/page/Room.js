import { useEffect, useState } from "react";
import Player from "../component/Player";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
const Room = ({ socket }) => {
  const [isReady, setIsReady] = useState(false);
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const [countdown, setCountdown] = useState(5);
  const [showCountdown, setShowCountdown] = useState(false);
  useEffect(() => {
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
        console.log("error: ", data);
        Swal.fire({
          title: `Lỗi xảy ra: ${data}`,
          timer: 2000,
          icon: "info",
          showConfirmButton: false,
        });
        navigate("/");
      });
      socket.emit("joinRoom", {
        roomId: id,
        token: localStorage.getItem("token"),
        type: "room",
      });
      // socket.emit("getPlayers", { roomId: id });
      socket.on("getPlayers", (data) => {
        if (data.success) {
          setPlayers(data.mes);
          data.mes.forEach(element => {
            if(element.token === localStorage.getItem('token')) {
              setIsReady(element.ready)
            }
          });
        }
      });
      socket.on("joinGame", () => {
        setTimeout(() => {
          navigate("/playing/" + id);
        }, 5000);
        setShowCountdown(true);
        handleJoinGame();
      });
      socket.on("onGame", () => {
        navigate("/playing/" + id);
      });
    }
    return () => {
      // socket.disconnect();
      socket.off("getPlayers");
      socket.off("error");
      socket.off("onGame");
      socket.off("getPlayers");
      socket.off("joinGame");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReady = (status) => {
    socket.emit("ready", {
      roomId: id,
      status: status,
      token: localStorage.getItem("token"),
    });
  };
  const handleExitRoom = () => {
    socket.emit("leaveRoom", {
      roomId: id,
      token: localStorage.getItem("token"),
    });
    // handleReady(false);
    navigate("/");
  };
  const handleJoinGame = () => {
    let temp = 0;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
      temp++;
      if (temp === 5) {
        clearInterval(timer);
        setShowCountdown(false);
      }
    }, 1000);
  };
  return (
    <div className="bgRoom p-5 flex flex-col items-center">
      {showCountdown && (
        <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-8xl text-center">
          Chuẩn bị vào game!
          <p className="">{countdown}</p>
        </div>
      )}
      <div className="flex gap-6 justify-center p-5">
        {/* <Player name={"Tạ Văn Tú"} />
        <Player name={"Tạ Văn Tú"} />
        <Player name={"Tạ Văn Tú"} />
        <Player name={"Tạ Văn Tú"} />
        <Player name={"Tạ Văn Tú"} /> */}
        {players.map((item, index) => {
          
          return <Player name={item.name} ready={item.ready} key={index} />;
        })}
      </div>
      {!isReady ? (
        <button
          className="px-4 py-2 bg-btn-main text-white w-28"
          onClick={() => {
            setIsReady(true);
            handleReady(true);
          }}
        >
          Sẵn sàng
        </button>
      ) : (
        <button
          onClick={() => {
            setIsReady(false);
            handleReady(false);
          }}
          className="px-4 py-2 bg-gray-600 text-white w-28"
        >
          Hủy
        </button>
      )}
      <button
        className="text-red-500 hover:underline"
        onClick={() => {
          handleExitRoom();
        }}
      >
        Thoát phòng
      </button>
    </div>
  );
};

export default Room;
