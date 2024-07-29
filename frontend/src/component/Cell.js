import { IoMdClose } from "react-icons/io";

const Cell = ({ size, fire, points, index, idx, handleKick, el, ratio }) => {
  return (
    <td
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`hover:bg-blue-300 ${fire && "bgFire"}
    ${points.find((el) => el.x === index && el.y === idx) && "bgShip"}
  `}
      key={idx}
      onClick={() => {
        handleKick(index, idx);
      }}
    >
      {el && !fire ? (
        <IoMdClose color="red" className="mx-auto" size={Math.round(640 / ratio) - 8} />
      ) : (
        <></>
      )}
    </td>
  );
};

export default Cell;
