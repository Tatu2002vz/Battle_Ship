const validateOptions = {
  nameroom: { required: "Tên hiển thị không được bỏ trống!" },
  capacity: {
    required: "Số lượng người không được bỏ trống!",
    min: {
      value: 2,
      message: "Số lượng người chơi tối thiểu là 2!",
    },
    max: {
      value: 5,
      message: "Số lượng người tối đa là 5!",
    },
  },
  ratio: {
    required: "Kích thước không được bỏ trống!",
    min: {
      value: 5,
      message: "Kích thước tối thiểu là 5!",
    },
  },
};
export default validateOptions;
