import './game.css';
import { useState } from 'react';

const MAXSHOTS = 5
const GRIDSIZE = 10
const NUMSHIPS = 5

function PlacedShip({ship}) {
  return (
    <div
      className='PlacedShip' 
      style={{
        width:  ship.orientation === "ver" ? '100%': "calc(" + (ship.length * 100) + "% + " + (2 * (ship.length - 1)) + "px)",
        height: ship.orientation === "ver" ? "calc(" + (ship.length * 100) + "% + " + (2 * (ship.length - 1)) + "px)": "100%",
        backgroundColor: "orange",
        zIndex: 1,
      }}
    />
  )
}

function SelectedShip({ship, canPlaceShip}) {

  let lengthString = "calc(" + (ship.length * 100) + "% + " + (2 * (ship.length - 1)) + "px)"

  return (
    <div
      className='SelectedShip' 
      style={{
        width:  ship.orientation === "ver" ? '100%': lengthString,
        height: ship.orientation === "ver" ? lengthString: "100%",
        backgroundColor: canPlaceShip ? "green" : "red",
        zIndex: 2,
      }}
    />
  )
}

function Cell({row, col, gameState, setGameState}) {
  // const [hasToken, setHasToken] = useState(false)

  const click = (e) => {
    // Check if ship conflicts
    if (gameState.isSelected) {

      if (!canPlaceShip()) {
        console.log("Can't place ship here")
        return;
      }

      let newShips = gameState.ships;
      newShips[gameState.selectedShip.index].isPlaced = true;
      newShips[gameState.selectedShip.index].position = gameState.selectedShip.position;


      // Update board
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


  const mouseEnter = (e) => {
    if (gameState.isSelected) {

      let length = gameState.selectedShip.length;
      let orientation = gameState.selectedShip.orientation;
  
      // Shift to place ship so that cursor in the the middle
      let baseShift = -1 * (Math.ceil(length / 2) - 1);
      let adjPosition = {
        x: (orientation === "ver" ? col: col + baseShift),
        y: (orientation === "ver" ? row + baseShift : row)
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

  const mouseExit = (e) => {
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
      className="Cell" 
      onClick={(event) => click(event)} 
      onMouseEnter={(e) => mouseEnter(e)} 
      onMouseOut={(e) => mouseExit(e)}
    >
      {/* <div className='Token staged hidden' col={props.col} row={props.row}></div> */}
      {/* {hasToken && 
        <div className='Token staged' col={col} row={row}/>
      } */}

      {/* Ghost ship when placing */}
      {(gameState.isSelected && col === gameState.selectedShip.position.x && row === gameState.selectedShip.position.y) &&
        <SelectedShip ship={gameState.selectedShip} canPlaceShip={canPlaceShip()}/>
      }

      {/* Placed ships */}
      {gameState.ships.map((ship, i) => 
        ((col === ship.position.x && row === ship.position.y) &&
          <PlacedShip key={i} ship={ship}/>
        )
      )}
    </button>
  )
}

function Table({gameState, setGameState}) {
  const list = []
  for (let i = 0; i < GRIDSIZE * GRIDSIZE; i++) {
    list.push(i)
  }

  return (
    <div className="Table">
      {list.map(i => 
        <Cell key={i} row={(i - i % GRIDSIZE) / GRIDSIZE} col={i % GRIDSIZE} gameState={gameState} setGameState={setGameState}></Cell>
      )}
    </div>
  );
}

function EnemyCell({row, col, gameState, setGameState}) {
  const [hasToken, setHasToken] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const click = (e) => {

    let newBoard = gameState.enemyBoard;

    // Check max shots
    // if (!hasToken) {
    if (gameState.enemyBoard[row][col] % 3 === 0) {
      if (gameState.shotsRemaining > 0) {
        newBoard[row][col] += 1;
        setHasToken(true);

        setGameState({
          ...gameState,
          enemyBoard: newBoard,
          shotsRemaining: gameState.shotsRemaining - 1
        });
      } else {
        console.log("No more shots remaining");
      }

    } else {
      if (newBoard[row][col] % 3 === 1) {
        if (gameState.shotsRemaining < MAXSHOTS) {

          newBoard[row][col] -= 1;
          setHasToken(false);
        
          setGameState({
            ...gameState,
            enemyBoard: newBoard,
            shotsRemaining: gameState.shotsRemaining + 1
          });
        } else {
          console.log("This shouldn't happen");
        }
      } else {
        console.log("Can't remove that token");
      }
      
    }
  }

  const mouseEnter = (e) => {
    setIsHovered(true);
  }

  const mouseExit = (e) => {
    setIsHovered(false);
  }

  return (
    <button 
      className="Cell" 
      onClick={(event) => click(event)} 
      onMouseEnter={(e) => mouseEnter(e)} 
      onMouseOut={(e) => mouseExit(e)}

      style={{cursor: "pointer"}}
    >
      {/* Ghost token to show where to place */}
      {isHovered &&
        <div 
          className='Token' 
          col={col} 
          row={row}
          style={{backgroundColor: "orange"}}
        /> 
      }

      {!isHovered && hasToken &&
        <div 
          className='Token' 
          col={col} 
          row={row}
          style={{
            backgroundColor: 
              (gameState.enemyBoard[row][col] % 3 === 2 && gameState.enemyBoard[row][col] > 2) ? "green" : 
              (gameState.enemyBoard[row][col] % 3 === 2 && gameState.enemyBoard[row][col] <= 2) ? "red" : 
              (gameState.enemyBoard[row][col] % 3 === 1) ? "yellow" : "blue"
          }}
        />
      }
    </button>
  )
}

function EnemyTable({gameState, setGameState}) {
  const list = []
  for (let i = 0; i < GRIDSIZE * GRIDSIZE; i++) {
    list.push(i)
  }

  return (
    <div className="Table">
      {list.map(i => 
        <EnemyCell key={i} row={(i - i % GRIDSIZE) / GRIDSIZE} col={i % GRIDSIZE} gameState={gameState} setGameState={setGameState}></EnemyCell>
      )}
    </div>
  );
}


function UnplacedShip({gameState, setGameState, length, orientation, index}) {

  const click = (e) => {
    if (gameState.isSelected && gameState.selectedShip.index === index) {
      setGameState({
        ...gameState,
        isSelected: false,
        selectedShip: {
          length: 0,
          orientation: "",
          index: -1,
          position: {
            x: -1,
            y: -1,
          }
        }
      })
    } else {
      setGameState({
        ...gameState,
        isSelected: true,
        selectedShip: {
          length: length,
          orientation: orientation,
          index: index,
          position: {
            x: -1,
            y: -1,
          }
        }
      })
    }
  }

  let lengthString = (20 * length) + "%"
  let colours = ["#fea3aa", "#f8b88b", "#faf884", "#baed91", "#b2cefe"];
  let selectedColours = ["#fd3546", "#f48a3e", "#f7f43b", "#92e250", "#367ffc"];

  return (
    <div
      className="UnplacedShip" 
      style={{
        height: orientation === "ver" ? lengthString: '20%',
        width:  orientation === "ver" ? '20%': lengthString,
        backgroundColor: (gameState.isSelected && gameState.selectedShip.index === index) ? selectedColours[index] : colours[index]
      }}
      onClick={(e) => click(e)}
    />
  );
}

function BoatSelectContainer({gameState, setGameState}) {

  function rotate(e) {
    if (gameState.isSelected) {
      let newShips = gameState.ships
      if (newShips[gameState.selectedShip.index].orientation === "ver") {
        newShips[gameState.selectedShip.index].orientation = "hor"
      } else {
        newShips[gameState.selectedShip.index].orientation = "ver"
      }

      setGameState({
        ...gameState,
        selectedShip: {
          ...gameState.selectedShip,
          orientation: newShips[gameState.selectedShip.index].orientation
        },
        ships: newShips,
      })
    }
  }

  
  function reset(e) {
    let resetShips = gameState.ships;
    for (let i = 0; i < resetShips.length; i++) {
      resetShips[i].isPlaced = false;
      resetShips[i].position =  {
        x: -1,
        y: -1,
      }
    }

    let board = []
    for (let i = 0; i < 10; i++) {
      let row = []
      for (let i = 0; i < 10; i++) {
        row.push(0)
      }
      board.push(row)
    }
  
    setGameState({
      ...gameState,
      isSelected: false,
      playerBoard: board,
      ships: resetShips,
      selectedShip: {
        length: 0,
        orientation: "",
        isPlaced: false,
        index: -1,
        position: {
          x: -1,
          y: -1,
        }
      }
    });
  }
    

  function enter(e) {
    setGameState({
      ...gameState,
      phase: "firing",
      enemyBoard: gameState.playerBoard //Temporary for testing
    });

    console.table(gameState.playerBoard);
  }


  return (
    <div className='BoatSelectContainer'>
      <div className='BoatSelectHorizontal'>
        {gameState.ships.map((boat, index) =>
          (boat.orientation === "ver" && !boat.isPlaced) &&
          <UnplacedShip
            key={index}
            gameState={gameState} 
            setGameState={setGameState}
            length={boat.length}
            orientation={boat.orientation}
            index={index}
          />
        )}
      </div>
      <div className='BoatSelectVertical'>
        {gameState.ships.map((boat, index) => 
          (boat.orientation === "hor" && !boat.isPlaced) &&
          <UnplacedShip
            key={index}
            gameState={gameState} 
            setGameState={setGameState}
            length={boat.length}
            orientation={boat.orientation}
            index={index}
          />
      )}
      </div>

      <button 
        className='boat-rotate-button'
        onClick={(e) => rotate(e)}
      > 
        Rotate
      </button>
      <button 
        className='boat-reset-button'
        onClick={(e) => reset(e)}
      > 
        Reset
      </button>
      <button 
        className='boat-enter-button'
        onClick={(e) => enter(e)}
      >
        Enter
      </button>
    </div>
  );
}

function ShotContainer({gameState, setGameState}) {

  function fire(e) {

    let newBoard = gameState.enemyBoard;
    for (let i = 0; i < newBoard.length; i++) {
      for (let j = 0; j < newBoard[i].length; j++) {
        if (newBoard[i][j] % 3 === 1) {
          newBoard[i][j] += 1;
        }
      }
    }

    let shipHits = new Array(NUMSHIPS).fill(0);
    for (let i = 0; i < newBoard.length; i++) {
      for (let j = 0; j < newBoard[i].length; j++) {
        if (newBoard[i][j] % 3 === 2 && newBoard[i][j] > 2) {
          shipHits[((newBoard[i][j] - 2) / 3) - 1] += 1;
        }
      }
    }

    setGameState({
      ...gameState,
      enemyBoard: newBoard,
      shotsRemaining: MAXSHOTS
    });

    console.table(gameState.enemyBoard);
    
  }

  return (
    <div className='ShotContainer'>
      {
        [...Array(gameState.shotsRemaining)].map((x, i) => <div key={i} className='Token staged'></div>)
      }
      <button
        className='shot-fire-button'
        onClick={(e) => fire(e)}
      > 
        Fire
      </button>
    </div>
  );
}

function Game() {

  // Make empty board
  const board = []
  for (let i = 0; i < 10; i++) {
    let row = []
    for (let i = 0; i < 10; i++) {
      row.push(0)
    }
    board.push(row)
  }

  // Make ship list
  const lengths = [2, 3, 3, 4, 5];
  let ships = [];
  for (let i = 0; i < lengths.length; i++) {
    let ship = {
      length: lengths[i],
      orientation: "ver",
      isPlaced: false,
      position: {
        x: -1,
        y: -1,
      },
    }
    ships.push(ship);
  }

  const [gameState, setGameState] = useState({
    phase: "placing",
    playerTurn: 0,
    shotsRemaining: 5,

    playerBoard: board,
    isSelected: false,
    ships: ships,
    selectedShip: {
      length: 0,
      orientation: "",
      isPlaced: false,
      index: -1,
      position: {
        x: -1,
        y: -1,
      }
    },

    enemyBoard: [],
    sunkShips: [],
  });

  return (
    <div className='Game'>
      <div id="table-container">
        {gameState.phase === "placing" ?
          <Table 
            gameState={gameState} 
            setGameState={setGameState}
          />
        :
          <EnemyTable 
            gameState={gameState} 
            setGameState={setGameState}
          />
        }

      </div>
      {gameState.phase === "placing" ?
        <BoatSelectContainer 
          gameState={gameState} 
          setGameState={setGameState}
        />
      :
        <ShotContainer 
          gameState={gameState} 
          setGameState={setGameState}
        />
      }
    </div>
  );
}

export default Game;
