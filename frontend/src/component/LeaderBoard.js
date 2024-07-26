const LeaderBoard = ({ className, data }) => {
  const dataCopy = [...data];
  dataCopy.sort((a, b) => b.point - a.point);
  return (
    <div
      className={`max-w-[300px] rounded-md bg-gray-600/50 text-white py-2 flex flex-col gap-2 ${className}`}
    >
      <h1 className="font-bold text-lg text-center">Ranking</h1>
      {dataCopy.map((item, index) => {
        return (
          <div className="py-1 bg-gray-600 flex justify-between px-4">
            <div className="flex gap-3">
              <p>
                {index + 1}
                <sup>
                  {index === 0
                    ? "st"
                    : index === 1
                    ? "nd"
                    : index === 2
                    ? "rd"
                    : "th"}
                </sup>
              </p>
              <p>{item?.name}</p>
            </div>
            <p>{item?.point}</p>
          </div>
        );
      })}
    </div>
  );
};

export default LeaderBoard;
