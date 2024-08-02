import avatar_default from "../assets/img/avartar_default_1.jpeg";
import { FaCheck } from "react-icons/fa";
const Player = (data) => {
  return (
    <>
      <div className="flex flex-col items-center text-white relative">
        <img
          src={avatar_default}
          className="w-20 h-20 object-cover rounded-full"
          alt=""
        />
        <p>{data?.name ? data?.name : "Ẩn danh"}</p>
        {data?.ready && (
          <FaCheck
            size={30}
            className="absolute text-green-500 top-0 right-0"
          />
        )}
      </div>
    </>
  );
};

export default Player;
