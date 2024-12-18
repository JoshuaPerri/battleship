import './game.css';
import { useState } from 'react';

// let max_shots = 5
const GRIDSIZE = 10

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

  var lengthString = "calc(" + (ship.length * 100) + "% + " + (2 * (ship.length - 1)) + "px)"

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

      var newShips = gameState.ships;
      newShips[gameState.selectedShip.index].isPlaced = true;
      newShips[gameState.selectedShip.index].position = gameState.selectedShip.position;


      // Update board
      // Remove previous placement of this ship
      var newBoard = gameState.playerBoard;
      for (var i = 0; i < newBoard.length; i++) {
        for (var j = 0; j < newBoard[i].length; j++) {
          if (newBoard[i][j] === (gameState.selectedShip.index + 1) * 3) {
            newBoard[i][j] = 0;
          }
        }
      }

      // Add new placement of the ship
      var position = gameState.selectedShip.position;
      for (i = 0; i < gameState.selectedShip.length; i++) {
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
    for (var i = 0; i < gameState.selectedShip.length; i++) {
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

      var length = gameState.selectedShip.length;
      var orientation = gameState.selectedShip.orientation;
  
      // Shift to place ship so that cursor in the the middle
      var baseShift = -1 * (Math.ceil(length / 2) - 1);
      var adjPosition = {
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

    var newBoard = gameState.enemyBoard;

    // Check max shots
    if (!hasToken) {

      newBoard[row][col] += 1;

      setGameState({
        ...gameState,
        enemyBoard: newBoard,
        // shotsRemaining: gameState.shotsRemaining - 1
      });
      setHasToken(true);
    } else {

      if (newBoard[row][col] % 3 === 1) {
        newBoard[row][col] -= 1;
      }

      setGameState({
        ...gameState,
        enemyBoard: newBoard,
        // shotsRemaining: gameState.shotsRemaining + 1
      });
      setHasToken(false);
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

  var lengthString = (100 * length) + "px"

  return (
    <div
      className="UnplacedShip" 
      style={{
        height: orientation === "ver" ? lengthString: '100px',
        width:  orientation === "ver" ? '100px': lengthString,
        backgroundColor: (gameState.isSelected && gameState.selectedShip.index === index) ? "blue": "lightblue"
      }}
      onClick={(e) => click(e)}
    />
  );
}

function BoatSelectContianer({gameState, setGameState}) {

  function rotate(e) {
    if (gameState.isSelected) {
      var newShips = gameState.ships
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
    var resetShips = gameState.ships;
    for (var i = 0; i < resetShips.length; i++) {
      resetShips[i].isPlaced = false;
      resetShips[i].position =  {
        x: -1,
        y: -1,
      }
    }

    var board = []
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

      <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around"}}>
        <button onClick={(e) => rotate(e)}>Rotate</button>
        <button onClick={(e) => reset(e)}>Reset</button>
        <button onClick={(e) => enter(e)}>Enter</button>
      </div>
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
  var ships = [];
  for (let i = 0; i < lengths.length; i++) {
    var ship = {
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
    shotsRemaining: 5,
    playerBoard: board,
    enemyBoard: [],
    isSelected: false,
    ships: ships,
    phase: "placing",
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
  })

  const click = (e) => {

    var newBoard = gameState.enemyBoard;
    for (let i = 0; i < newBoard.length; i++) {
      for (let j = 0; j < newBoard[i].length; j++) {
        if (newBoard[i][j] % 3 === 1) {
          newBoard[i][j] += 1;
        }
      }
    }

    setGameState({
      ...gameState,
      enemyBoard: newBoard,
    })

    console.table(gameState.enemyBoard);
  }

  return (
    <div className='Game'>
      <BoatSelectContianer 
        gameState={gameState} 
        setGameState={setGameState}
      />
      <div id="container">
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
      <button onClick={(event) => click(event)}>Fire</button>
    </div>
  );
}

export default Game;
