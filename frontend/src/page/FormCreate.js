import { useForm,  } from "react-hook-form";
import validateOptions from "../helper/validate";
const FormCreate = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => console.log(data);
  return (
    <div className="min-w-[400px]">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        {/* register your input into the hook by invoking the "register" function */}
        <div className="flex flex-col pb-6 relative">
          <label htmlFor="nameroom">Tên phòng</label>
          <input
            className="h-8 outline-none rounded-lg px-2"
            id="nameroom"
            {...register("nameroom", validateOptions.nameroom)}
            placeholder="Tên phòng"
          />
          {errors.nameroom && (
            <p className="text-xs text-red-500 absolute bottom-[6px]">
              {`${errors.nameroom.message}`}
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
        <input type="submit" className="bg-[#333] text-white rounded-full py-2" value={'Tạo phòng mới'} />
      </form>
    </div>
  );
};

export default FormCreate;
