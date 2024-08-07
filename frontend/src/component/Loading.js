const Loading = () => {
  return (
    <div className="w-full h-full fixed top-0 left-0 right-0 bottom-0 z-40 bg-slate-600/25">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <span class="loader"></span>
        <div className="text-xl text-white">Loading ...</div>
      </div>
    </div>
  );
};

export default Loading;
