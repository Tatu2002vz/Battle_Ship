// Sinh vị trí ngẫu nhiên hợp lệ cho 1 tàu 3 ô (chỉ ngang/dọc).
// Dùng cho nút "Random" phía server (event randomShip) để client
// không phải đoán vị trí tàu của người khác.
//
// occupiedKeys: Set các key "x,y" đã có tàu trong phòng.
// Trả về [[x,y],[x,y],[x,y]] hoặc null nếu bàn không còn chỗ.
const { cellKey, SHIP_LENGTH } = require("./validateShip");

const buildCells = (x, y, horizontal) => {
  const cells = [];
  for (let i = 0; i < SHIP_LENGTH; i++) {
    cells.push(horizontal ? [x + i, y] : [x, y + i]);
  }
  return cells;
};

const isFree = (cells, size, occupiedKeys) =>
  cells.every(
    ([x, y]) =>
      x < size && y < size && !(occupiedKeys && occupiedKeys.has(cellKey(x, y)))
  );

const generateShipPlacement = (ratio, occupiedKeys) => {
  const size = Number(ratio);
  if (!Number.isInteger(size) || size < SHIP_LENGTH) return null;

  for (let attempt = 0; attempt < 200; attempt++) {
    const horizontal = Math.random() < 0.5;
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    const cells = buildCells(x, y, horizontal);
    if (isFree(cells, size, occupiedKeys)) return cells;
  }

  // Dự phòng: quét toàn bộ bàn để tìm vị trí còn trống
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      for (const horizontal of [true, false]) {
        const cells = buildCells(x, y, horizontal);
        if (isFree(cells, size, occupiedKeys)) return cells;
      }
    }
  }
  return null;
};

module.exports = generateShipPlacement;
module.exports.generateShipPlacement = generateShipPlacement;
