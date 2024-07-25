# Battleship
A real-time [battleship game](<https://en.wikipedia.org/wiki/Battleship_(game)>) (also known as Battleships or Sea Battle) for players, built with [React](https://reactjs.org/) and [Socket.IO](https://socket.io/).

The project is built on [create-react-app-example](https://create-react-app.dev/) of [Socket.io](https://socket.io/).


## Table of Content

- [Final Product](#final-product)
- [About the Game](#about-the-game)
- [Custom hook: useGame](#custom-hook-usegame)
- [Dependencies](#dependencies)
- [Getting Started](#getting-started)
- [File Structure](#file-structure)
- [Credits](#credits)
              
## Final Product

1. When players first enter the game, they need to create a room and wait for others to join the game! 

![Waiting for opponent](./docs/home.png)

2. The user creates a playroom and waits for others to join (For testing purpose, they can also open a new tab to create another player)

![Picking Tiles](./docs/room.png)

3. After all the players in the room are ready, the game starts, in the game everyone will take turns attacking the bricks, if that tile has a ship, the enemy will notify all players by burning that brick!

![Players taking turn](./docs/playing.png)


4. When you lose, you will be redirected to the home screen and notified, so will winning.
![End of the game](./docs/win.png)
![End of the game](./docs/lost.png)

## About the Game

- When entering the game, each person sees a 32x32 matrix. 
- Each ship can be placed horizontally, vertically, or diagonally on the board and cannot be partially placed off the board, and the player can only see his ship. 
- Then, each player takes turns selecting a tile on the opponent's grid, shooting at it. 
- If the cell contains the ship, it will catch fire. 
- If the cell does not contain a ship, it is marked with an X.

- The game ends when all users escape, or only 1 player is left who has not been completely destroyed


## Dependencies

- [Node.js](https://nodejs.org/)
- [React](https://reactjs.org/)
- [Socket.io](https://socket.io/)
- [Redis](https://redis.io/)
- [MongoDB](https://www.mongodb.com/)

## Getting Started
1. Clone this project to your computer
2. `cd` to folders 'backend' and 'frontend' where this project is cloned
3. Install all dependencies with `npm install` command for both folders
4. Run project with `npm start` command for both folders
5. Open the broswer and visit: http://localhost:3000

The page will reload if you make edits. You will also see any lint errors in the console.

## File Structure
icon: ┃    ┣     ┗
```
📦battle_ship
 ┣ 📂docs
 ┣ 📂public
 ┃ ┣ 📜favicon.png
 ┃ ┗ 📜index.html
 ┣ 📂src
 ┃ ┣ 📂Components
 ┃ ┃ ┣ 📂Display
 ┃ ┃ ┃ ┣ 📂Board
 ┃ ┃ ┃ ┃ ┣ 📂Coordinate
 ┃ ┃ ┃ ┃ ┃ ┣ 📜Coordinate.css
 ┃ ┃ ┃ ┃ ┃ ┣ 📜CoordinateLabelList.jsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜CoordinateLabelListItem.jsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜CoordinateList.jsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜CoordinateListItem.jsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜index.jsx
 ┃ ┃ ┃ ┃ ┣ 📂ShipList
 ┃ ┃ ┃ ┃ ┃ ┣ 📜ShipList.css
 ┃ ┃ ┃ ┃ ┃ ┣ 📜ShipListItem.jsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜TileButtons.jsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜index.jsx
 ┃ ┃ ┃ ┃ ┣ 📜Board.css
 ┃ ┃ ┃ ┃ ┣ 📜Overlay.jsx
 ┃ ┃ ┃ ┃ ┗ 📜index.jsx
 ┃ ┃ ┃ ┣ 📜Display.css
 ┃ ┃ ┃ ┗ 📜index.jsx
 ┃ ┃ ┣ 📂Log
 ┃ ┃ ┃ ┣ 📜Log.css
 ┃ ┃ ┃ ┣ 📜LogListItem.jsx
 ┃ ┃ ┃ ┣ 📜NewGameButton.jsx
 ┃ ┃ ┃ ┗ 📜index.jsx
 ┃ ┃ ┗ 📜Heading.jsx
 ┃ ┣ 📂hooks
 ┃ ┃ ┣ 📜useGame.js
 ┃ ┃ ┗ 📜useScrollToBottom.js
 ┃ ┣ 📜App.css
 ┃ ┣ 📜App.jsx
 ┃ ┣ 📜constants.js
 ┃ ┣ 📜helpers.js
 ┃ ┗ 📜index.js
 ┣ 📜.gitignore
 ┣ 📜README.md
 ┣ 📜helpers.js
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┗ 📜server.js
```

### 📂docs

### 📂public

Contains the favicon.png (image displayed in the web app) ajd index.html (document where the app is render).

### 📂src

#### 📂Components

Contains most react components of the app.

#### 📂hooks

Contains the custom hooks `useGame` (See [Custom hook: useGame](#custom-hook-usegame) for details) and `useScrollToBottom`.  
The log list is always scroll to the bottom. This is controlled by `useScrollToBottom`.

#### 📜App.css

Contains styles of react component (`App.jsx`).

#### 📜App.jsx

The high level root react component.

#### 📜constants.js

Contain constants that are used in the client.

#### 📜helpers.js

Contain helper functions used by the client.

#### 📜index.js

Renders the component.

### 📜.gitignore

Specifies intentionally untracked files that Git should ignore.

### 📜README.md

This document that you are reading.

### 📜helpers.js

Contain the helper functions used by the server.

### 📜package.json

Contain the commands and dependecies for the server.

### 📜server.js

The main file where the server is defined.

## Credits

- [Icon](https://www.flaticon.com/premium-icon/ship_870170) created by [Freepik](https://www.flaticon.com/authors/freepik) - [Flaticon](https://www.flaticon.com/)
