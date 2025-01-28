import '../styles/EnemyTile.css'

import PlacedShip from "./PlacedShip";
import {useState, useRef} from 'react';

const MAXSHOTS = 5;

export default function EnemyTile({gameState, setGameState, tilePos, enabled}) {
  const [isHovered, setIsHovered] = useState(false);
  const shotIndex = useRef(-1);

  const click = () => {

    // Token placed on previous turn
    if (gameState.enemyBoard[tilePos.y][tilePos.x] > 1) {
      console.log("Can't remove token at", tilePos);
    // Token placed on this turn
    } else if (gameState.enemyBoard[tilePos.y][tilePos.x] > 0) {

      if (gameState.shotsRemaining >= MAXSHOTS) {
        console.log("You shouldn't see this, shots remaining can't exceed", MAXSHOTS);
      } else {

        // Free space in shot list to be overwritten
        let updatedIndicies = gameState.freeShotIndicies;
        updatedIndicies.push(shotIndex.current);
        shotIndex.current = -1;

        // Remove token from visual board
        let newBoard = gameState.enemyBoard;
        newBoard[tilePos.y][tilePos.x] = 0;

        // Increment and update shotsRemaining, shots list
        setGameState({
          ...gameState, 
          shotsRemaining: gameState.shotsRemaining + 1,
          freeShotIndicies: updatedIndicies,
          enemyBoard: newBoard,
        });

        console.log("Token removed");
      }

    // No token here
    } else {

      // Add token, decrement shotsremaining, add shot to list
      if (gameState.shotsRemaining <= 0) {
        console.log("No more shots remaining");
      } else {
    
        // Save an index for storing the shot location at
        let updatedIndicies = gameState.freeShotIndicies;
        shotIndex.current = updatedIndicies.pop();

        // Add shot to shot list
        let newShots = gameState.shots;
        newShots[shotIndex.current] = tilePos;

        // Add token to visual board
        let newBoard = gameState.enemyBoard;
        newBoard[tilePos.y][tilePos.x] = 1;

        // Decrement and update shotsRemaining, shots list
        setGameState({
          ...gameState,
          shotsRemaining: gameState.shotsRemaining - 1,
          shots: newShots,
          freeShotIndicies: updatedIndicies,
          enemyBoard: newBoard,
        });

        console.log("Token added");
      }
    }
  }

  const mouseEnter = () => {
    setIsHovered(true);
  }

  const mouseExit = () => {
    setIsHovered(false);
  }

  return (
    <button 
      className="EnemyTile"
      onClick={() => enabled && click()} 
      onMouseEnter={() => enabled && mouseEnter()} 
      onMouseOut={() => enabled && mouseExit()}

      style={{
        cursor: enabled ? "pointer" : "unset"
      }}
    >

      {gameState.sunkShips.map((ship, i) => 
        ((tilePos.x === ship.position.x && tilePos.y === ship.position.y) &&
          <PlacedShip key={i} ship={ship}/>
        )
      )}

      {/* Ghost token to show where to place */}
      {isHovered &&
        <div 
          className='Token'
          style={{
            backgroundColor:"orange",
            zIndex: 2,
          }}
        /> 
      }

      {!isHovered && gameState.enemyBoard[tilePos.y][tilePos.x] > 0 &&
        <div
          className='Token'
          style={{
            backgroundColor: 
              (gameState.enemyBoard[tilePos.y][tilePos.x] === 1) ? "yellow" :
              (gameState.enemyBoard[tilePos.y][tilePos.x] === 2) ? "white" :
              (gameState.enemyBoard[tilePos.y][tilePos.x] === 3) ? "red" :
              "blue",
            zIndex: 1,
          }}
        />
      }

    </button>
  )
}