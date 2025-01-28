import '../styles/PlayerTile.css';

import HoveredShip from "./HoveredShip";
import PlacedShip from "./PlacedShip";

const GRIDSIZE = 10;

export default function PlayerTile({gameState, setGameState, tilePos}) {

  const click = () => {

    // Ensure that a ships is selected to be placed
    if (gameState.isSelected) {

      // Check if the ship would conflict with an other placed ship
      if (!canPlaceShip()) {
        console.log("Can't place ship here");
        return;
      }

      // Update ships list
      let newShips = gameState.ships;
      newShips[gameState.selectedShip.index].isPlaced = true;
      newShips[gameState.selectedShip.index].position = gameState.selectedShip.position;

      // Remove previous placement of this ship
      let newBoard = gameState.playerBoard;
      for (let i = 0; i < newBoard.length; i++) {
        for (let j = 0; j < newBoard[i].length; j++) {
          if (newBoard[i][j] === (gameState.selectedShip.index + 1) * 3) {
            newBoard[i][j] = 0;
          }
        }
      }

      // Add new placement of the ship
      let position = gameState.selectedShip.position;
      for (let i = 0; i < gameState.selectedShip.length; i++) {
        if (gameState.selectedShip.orientation === "ver") {
          // Multiply by three to help encode ships and tokens in the same board
          newBoard[position.y + i][position.x] = (gameState.selectedShip.index + 1) * 3;
        } else {
          newBoard[position.y][position.x + i] = (gameState.selectedShip.index + 1) * 3;
        }
      }

      setGameState({
        ...gameState,
        isSelected: false,
        playerBoard: newBoard,
        ships: newShips,
        selectedShip: {
          length: 0,
          orientation: "",
          index: -1,
          position: {
            x: -1,
            y: -1,
          }
        }
      });
    }
  }

  function canPlaceShip() {
    for (let i = 0; i < gameState.selectedShip.length; i++) {
      if (gameState.selectedShip.orientation === "ver") {
        if (gameState.playerBoard[gameState.selectedShip.position.y + i][gameState.selectedShip.position.x] !== 0) {
          return false;
        }
      } else {
        if (gameState.playerBoard[gameState.selectedShip.position.y][gameState.selectedShip.position.x + i] !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  const mouseEnter = () => {
    if (gameState.isSelected) {

      let length = gameState.selectedShip.length;
      let orientation = gameState.selectedShip.orientation;

      // Shift to place ship so that cursor in the the middle
      let baseShift = -1 * (Math.ceil(length / 2) - 1);
      let adjPosition = {
        x: (orientation === "ver" ? tilePos.x: tilePos.x + baseShift),
        y: (orientation === "ver" ? tilePos.y + baseShift : tilePos.y)
      }

      // If the ship would be out-of-bounds on the left or top
      adjPosition.x = Math.max(adjPosition.x, 0);
      adjPosition.y = Math.max(adjPosition.y, 0);
  
      // If the ship would be out-of-bounds on the bottom or right
      if (orientation === "ver") {
        adjPosition.x = Math.min(GRIDSIZE, adjPosition.x);
        adjPosition.y = Math.min(GRIDSIZE, adjPosition.y + length) - length;
      } else {
        adjPosition.x = Math.min(GRIDSIZE, adjPosition.x + length) - length;
        adjPosition.y = Math.min(GRIDSIZE, adjPosition.y);
      }

      setGameState({
        ...gameState,
        selectedShip: {
          ...gameState.selectedShip,
          position: adjPosition
        }
      });
    }
  }

  const mouseExit = () => {
    if (gameState.isSelected) {
      setGameState({
        ...gameState,
        selectedShip: {
          ...gameState.selectedShip,
          position: {
            x: -1,
            y: -1,
          }
        }
      });
    }
  }

  return (
    <button
      className="PlayerTile" 
      onClick={() => click()} 
      onMouseEnter={() => mouseEnter()} 
      onMouseOut={() => mouseExit()}
    >

      {/* Ghost ship when placing */}
      {(gameState.isSelected && tilePos.x === gameState.selectedShip.position.x && tilePos.y === gameState.selectedShip.position.y) &&
        <HoveredShip ship={gameState.selectedShip} canPlaceShip={canPlaceShip()}/>
      }

      {/* Placed ships */}
      {gameState.ships.map((ship, i) => 
        ((tilePos.x === ship.position.x && tilePos.y === ship.position.y) &&
          <PlacedShip key={i} ship={ship}/>
        )
      )}

      {/* Enemy tokens on your board */}
      {gameState.playerBoard[tilePos.y][tilePos.x] % 3 !== 0 &&
        <div
          className='Token'
          style={{
            backgroundColor:
              (gameState.playerBoard[tilePos.y][tilePos.x] % 3 === 1) ? (gameState.playerBoard[tilePos.y][tilePos.x] >= 3) ?
              "red" :  "white" : "blue"
          }}
        />
      }
    </button>
  )
}