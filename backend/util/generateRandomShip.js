function randomizeShips(boardSize, numberOfShips) {
  // Khởi tạo một mảng rỗng để lưu trữ các tọa độ của các tàu
  let ships = [];

  // Hàm kiểm tra xem một tàu có trùng với các tàu hiện có không
  function isOverlap(ship) {
    for (let existingShip of ships) {
      for (let [x, y] of ship) {
        if (existingShip.some(([ex, ey]) => ex === x && ey === y)) {
          return true;
        }
      }
    }
    return false;
  }

  // Hàm tạo một tàu ngẫu nhiên với chiều dài và chiều rộng cho trước
  function generateShip(length, width) {
    let ship = [];

    let direction = Math.random();
    // Tạo tọa độ cho tàu theo chiều dọc
    if (direction < 0.33) {
      let startX = Math.floor(Math.random() * (boardSize - width + 1));
      let startY = Math.floor(Math.random() * (boardSize - length + 1));

      for (let i = 0; i < length; i++) {
        ship.push([startX, startY + i]);
      }
    }
    // Tạo tọa độ cho tàu theo chiều ngang
    else if (direction < 0.67) {
      let startX = Math.floor(Math.random() * (boardSize - length + 1));
      let startY = Math.floor(Math.random() * (boardSize - width + 1));

      for (let i = 0; i < length; i++) {
        ship.push([startX + i, startY]);
      }
    } else {
      let startX;
      let startY;
      if (length > width) {
        startX = Math.floor(Math.random() * (boardSize - length + 1));
        startY = Math.floor(Math.random() * (boardSize - length + 1));
      } else {
        startX = Math.floor(Math.random() * (boardSize - width + 1));
        startY = Math.floor(Math.random() * (boardSize - width + 1));
      }

      for (let i = 0; i < length; i++) {
        ship.push([startX + i, startY + i]);
      }
    }

    return ship;
  }

  // Tạo các tàu ngẫu nhiên
  while (ships.length < numberOfShips) {
    let ship = generateShip(3, 1);

    if (!isOverlap(ship)) {
      ships.push(ship);
    }
  }

  return ships;
}

// Sử dụng hàm randomizeShips để lấy danh sách tọa độ của 5 tàu
// let ships = randomizeShips(32, 5);

// // In ra danh sách tọa độ của từng tàu
// for (let i = 0; i < ships.length; i++) {
//   console.log(`Tàu ${i + 1}:`, ships[i]);
// }

module.exports = randomizeShips;
