// Validate đội hình 1 tàu (3 ô) do người chơi tự đặt.
// Hàm thuần (không chạm Redis) để test độc lập được.
//
// cells: [[x, y], [x, y], [x, y]]
// ratio: kích thước bàn (bàn vuông ratio x ratio)
// occupiedKeys: Set các key "x,y" đã có tàu của NGƯỜI KHÁC trong phòng
const SHIP_LENGTH = 3;

const cellKey = (x, y) => `${x},${y}`;

const validateShip = (cells, ratio, occupiedKeys) => {
  if (!Array.isArray(cells) || cells.length !== SHIP_LENGTH) {
    return { valid: false, mes: `Tàu phải có đúng ${SHIP_LENGTH} ô` };
  }

  const size = Number(ratio);
  if (!Number.isInteger(size) || size < SHIP_LENGTH) {
    return { valid: false, mes: "Kích thước bàn cờ không hợp lệ" };
  }

  const seen = new Set();
  for (const cell of cells) {
    if (
      !Array.isArray(cell) ||
      cell.length !== 2 ||
      !Number.isInteger(cell[0]) ||
      !Number.isInteger(cell[1])
    ) {
      return { valid: false, mes: "Tọa độ tàu không hợp lệ" };
    }
    const [x, y] = cell;
    if (x < 0 || y < 0 || x >= size || y >= size) {
      return { valid: false, mes: "Tàu nằm ngoài bàn cờ" };
    }
    const key = cellKey(x, y);
    if (seen.has(key)) {
      return { valid: false, mes: "Các ô của tàu bị trùng nhau" };
    }
    seen.add(key);
    if (occupiedKeys && occupiedKeys.has(key)) {
      return {
        valid: false,
        mes: "Vị trí này không đặt được, hãy chọn vị trí khác",
      };
    }
  }

  const xs = cells.map((c) => c[0]);
  const ys = cells.map((c) => c[1]);
  const sameX = xs.every((v) => v === xs[0]);
  const sameY = ys.every((v) => v === ys[0]);
  if (!sameX && !sameY) {
    return { valid: false, mes: "Tàu phải đặt thẳng theo hàng ngang hoặc dọc" };
  }

  const line = (sameX ? ys : xs).slice().sort((a, b) => a - b);
  for (let i = 1; i < line.length; i++) {
    if (line[i] !== line[i - 1] + 1) {
      return { valid: false, mes: "Các ô của tàu phải liền nhau" };
    }
  }

  return { valid: true, mes: "Hợp lệ", cells: cells.map((c) => [c[0], c[1]]) };
};

module.exports = { validateShip, cellKey, SHIP_LENGTH };
