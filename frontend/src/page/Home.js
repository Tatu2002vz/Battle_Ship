import { Fragment, useEffect, useState } from "react";
import { MdMeetingRoom } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import RoomComponent from "../component/RoomComponent";
import { useNavigate } from "react-router-dom";
import { apiGetRooms } from "../api/Room";
import Swal from "sweetalert2";
import { useForm,  } from "react-hook-form";
import validateOptions from "../helper/validate";
// import FormCreate from "./FormCreate";
const Home = ({ socket }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [name, setName] = useState("");
  const [isCreateRoom, setIsCreateRoom] = useState(false);

  const [listRoom, setListRoom] = useState([]);
  const navigate = useNavigate();

  // Fetch API get list rooms
  const getAllRooms = async () => {
    const allRooms = await apiGetRooms();
    if (allRooms?.success) {
      setListRoom(allRooms?.mes);
    } else {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: `Có lỗi xảy ra: ${allRooms?.mes}`,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };
  useEffect(() => {
    // lấy danh sách phòng
    getAllRooms();
    // console.log('socket active: ' + socket.connected)
    if (socket) {
      let token = localStorage.getItem("token");
      let data = {}
      if (token) {
        socket.on("connect", () => {
          data = { token: token, name: name, socketId: socket.id };
          socket.emit("visited", data);
          setTimeout(() => {
            socket.emit("current", data);
            socket.on("current", (data) => {
              if (data?.roomId !== "") {
                navigate("/room/" + data?.roomId);
              }
              setName(data?.name);
            });
          }, 500);
        });
        socket.on("error", (data) => {
          console.log("data error: " + data);
          navigate("/");
        });
        socket.on("createRoom", async (data) => {
          if (data.success) {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Tạo phòng thành công!",
              showConfirmButton: false,
              timer: 1500,
            });
            setIsCreateRoom(false);
          }
        });
        // lấy danh sách phòng
        socket.on("getRoom", (data) => {
          if (data.success) {
            setListRoom(data.mes);
          } else {
            Swal.fire({
              position: "top-end",
              icon: "error",
              title: "Có lỗi xảy ra!",
              showConfirmButton: false,
              timer: 1500,
            });
          }
        });
      }
    }
    return () => {
      socket.off("getRoom");
      socket.off("createRoom");
      socket.off("error");
      socket.off("current");
      // socket.disconnect();
      // window.removeEventListener("pageshow", handlePageShow);
      // window.removeEventListener("unload", function () {});
      // window.removeEventListener("beforeunload", function () {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onSubmit = (data) => {
    data.token = localStorage.getItem("token");
    socket.emit("createRoom", data);
    socket.on("createRoom", (data) => {
      if (data.success) {
        navigate("/room/" + data.mes.entityId);
      } else {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Có lỗi xảy ra!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };


  const handleChangeName = () => {
    socket.emit("changeName", name);
  };
  return (
    <div className="relative">
      {isCreateRoom && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-5 backdrop-blur-lg bg-gray-500/15 z-10 rounded-md ">
          <IoClose
            className="absolute right-0 top-0 cursor-pointer"
            size={30}
            title="Thoát"
            onClick={() => setIsCreateRoom(false)}
          />
          <div className="min-w-[400px]">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
              {/* register your input into the hook by invoking the "register" function */}
              <div className="flex flex-col pb-6 relative">
                <label htmlFor="nameRoom">Tên phòng</label>
                <input
                  className="h-8 outline-none rounded-lg px-2"
                  id="nameRoom"
                  {...register("nameRoom", validateOptions.nameRoom)}
                  placeholder="Tên phòng"
                />
                {errors.nameRoom && (
                  <p className="text-xs text-red-500 absolute bottom-[6px]">
                    {`${errors.nameRoom.message}`}
                  </p>
                )}
              </div>
              <div className="flex flex-col pb-6 relative">
                <label htmlFor="capacity">Số lượng người chơi</label>
                <input
                  className="h-8 outline-none rounded-lg px-2"
                  id="capacity"
                  {...register("capacity", validateOptions.capacity)}
                  placeholder="2 <= x <= 5"
                />
                {errors.capacity && (
                  <p className="text-xs text-red-500 absolute bottom-[6px]">
                    {`${errors.capacity.message}`}
                  </p>
                )}
              </div>
              <div className="flex flex-col pb-6 relative">
                <label htmlFor="ratio">Kích thước bảng</label>
                <input
                  className="h-8 outline-none rounded-lg px-2"
                  id="ratio"
                  {...register("ratio", validateOptions.ratio)}
                  placeholder="x >= 5"
                />

                {errors.ratio && (
                  <p className="text-xs text-red-500 absolute bottom-[6px]">
                    {`${errors.ratio.message}`}
                  </p>
                )}
              </div>
              <input
                type="submit"
                className="bg-[#333] text-white rounded-full py-2 cursor-pointer"
                value={"Tạo phòng mới"}
              />
            </form>
          </div>
        </div>
      )}

      <div className="bgHome fixed top-0 left-0 right-0 bottom-0"></div>
      <div>
        <div className="relative min-h-32">
          <h1 className="title uppercase text-5xl md:text-7xl lg:text-9xl text-black">
            BattleShip War
          </h1>
          <h1 className="title uppercase text-5xl md:text-7xl lg:text-9xl text-black">
            BattleShip War
          </h1>
        </div>
        <form className="text-center">
          <input
            type="text"
            onChange={(e) => {
              setName(e.target.value);
            }}
            onFocus={(e) => {
            }}
            onBlur={(e) => {
              handleChangeName();
            }}
            value={name}
            placeholder="Nhập tên của bạn (mặc định: Ẩn danh)"
            className="outline-none rounded-md bg-gray-500 min-w-96 placeholder:text-white scale-y-100 h-10 px-3 text-white"
          />
          <button
            className="bg-main-color text-white px-4 py-2 rounded-md block mx-auto my-4"
            onClick={(e) => {
              e.preventDefault();
              setIsCreateRoom(true);
            }}
          >
            Tạo phòng mới +{" "}
          </button>
        </form>
        <div className="min-w-80 max-w-[500px] min-h-40 border border-gray-400 rounded-md mx-auto backdrop-blur-lg">
          <h2 className="flex py-2 text-main-color font-bold text-xl border-b border-b-gray-400">
            <MdMeetingRoom className="text-main-color mr-2" size={24} />
            <p>Danh sách các phòng trực tuyến</p>
          </h2>
          {listRoom?.length === 0 && (
            <div>Không có phòng nào đang tồn tại!</div>
          )}
          {listRoom?.map((item, index) => {
            return !item?.isStart ? (
              <RoomComponent
                key={index}
                name={item?.name}
                numberOfPlayer={item?.numberOfRoom}
                capacity={item?.capacity}
                id={item?.entityId}
                isStart={item?.isStart}
                ratio={item?.ratio}
              />
            ) : (
              <Fragment></Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
