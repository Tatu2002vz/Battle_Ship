import { HiUserGroup } from "react-icons/hi2";
import { NavLink } from "react-router-dom";

const RoomComponent = ({ name, numberOfPlayer, capacity, id, isStart, ratio }) => {
  return (
    <NavLink
      to={"/room/" + id}
      className="py-2 flex justify-between px-4 cursor-pointer border-b border-b-gray-400 last:border-0 hover:bg-main-color hover:text-white font-semibold"
      title="Click để tham gia"
    >
      <p>{name}</p>
      <p>{ratio && `${ratio}x${ratio}`}</p>
      <p className="flex items-center">
        {numberOfPlayer}/{capacity} <HiUserGroup className="ml-1" />
      </p>
    </NavLink>
  );
};

export default RoomComponent;
