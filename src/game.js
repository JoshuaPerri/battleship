import './game.css';
import { useState } from 'react';

// let max_shots = 5
const GRIDSIZE = 10

// function toggleClass(element, className) {
//   if (element.classList.contains(className)) {
//     element.classList.remove(className)
//     return true
//   } else {
//     element.classList.add(className)
//     return false
//   }
// }

function Cell({row, col, gameState, setGameState}) {
  // const [hasToken, setHasToken] = useState(false)

  const click = (e) => {
    // let button = e.currentTarget
    // Search children of button to get token
    // let token = Array.from(button.children).filter((child) => child.classList.contains("Token"))[0];

    // if (!hasToken) {
    //   if (gameState.shotsRemaining > 0) {
    //     setGameState({
    //       ...gameState, 
    //       shotsRemaining: gameState.shotsRemaining - 1
    //     });
    //     setHasToken(true);
    //   }
    // } else {
    //   if (gameState.shotsRemaining < max_shots) {
    //     setGameState({
    //       ...gameState, 
    //       shotsRemaining: gameState.shotsRemaining + 1
    //     });
    //     setHasToken(false);
    //   }
    // }

    // Check if ship conflicts
    if (gameState.isSelected) {
      var newShips = gameState.ships;
      newShips[gameState.selectedShip.index].isPlaced = true;
      newShips[gameState.selectedShip.index].position = {
        x: row + (shipOrientation === "ver" ? shiftFactor: 0),
        y: col + (shipOrientation === "ver" ? 0: shiftFactor),
      }
      setGameState({
        ...gameState,
        isSelected: false,
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

      // Update board
      // Remove previous placement of this ship
      for (var i = 0; i < gameState.board.length; i++) {
        for (var j = 0; j < gameState.board[i].length; j++) {
          if (gameState.board[i][j] === gameState.selectedShip.index + 1) {
            gameState.board[i][j] = 0;
          }
        }
      }

      // Add new placement of the ship
      var newBoard = gameState.board;
      var position = gameState.selectedShip.position
      for (var i = 0; i < gameState.selectedShip.length; i++) {
        if (gameState.selectedShip.orientation === "ver") {
          newBoard[position.x + i][position.y] = gameState.selectedShip.index + 1;
        } else {
          newBoard[position.x][position.y + i] = gameState.selectedShip.index + 1;
        }
      }
      console.log(gameState.board);
    }
  }


  var shipLength = gameState.selectedShip.length;
  var shipOrientation = gameState.selectedShip.orientation;





  var shiftFactor = Math.min(GRIDSIZE - ((shipOrientation === "ver" ? row: col) + shipLength), 0);

  const checkGrid = () => {
    for (var i = 0; i < gameState.selectedShip.length; i++) {

    }
  }


  const mouseEnter = (e) => {
    if (gameState.isSelected) {

      var length = gameState.selectedShip.length;
      var orientation = gameState.selectedShip.orientation;
  
      var baseShift = -1 * (Math.ceil(length / 2) - 1);
      var estPosition = {
        x: (shipOrientation === "ver" ? col: col + baseShift),
        y: (shipOrientation === "ver" ? row + baseShift : row)
      }
    
      // If the ship would be out-of-bounds on the left or top
      estPosition.x = Math.max(estPosition.x, 0);
      estPosition.y = Math.max(estPosition.y, 0);
  
      // If the ship would be out-of-bounds on the bottom or right
      if (orientation === "ver") {
        estPosition.x = Math.min(GRIDSIZE, estPosition.x);
        estPosition.y = Math.min(GRIDSIZE, estPosition.y + length) - length;
      } else {
        estPosition.x = Math.min(GRIDSIZE, estPosition.x + length) - length;
        estPosition.y = Math.min(GRIDSIZE, estPosition.y);
      }

      setGameState({
        ...gameState,
        selectedShip: {
          ...gameState.selectedShip,
          position: estPosition
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


  var lengthString = "calc(" + (shipLength * 100) + "% + " + (2 * (shipLength - 1)) + "px)"

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
      {(gameState.isSelected && col === gameState.selectedShip.position.x && row === gameState.selectedShip.position.y && gameState.board[row][col] === 0) &&
        <div
          className='Temp' 
          style={{
            width:  shipOrientation === "ver" ? '100%': lengthString,
            height: shipOrientation === "ver" ? lengthString: "100%"
          }}
        />
      }

      {/* Placed ships */}
      {gameState.ships.map((ship, i) => 
        ((row === ship.position.x && col === ship.position.y) &&
          <div
            key={i}
            className='Temp' 
            style={{
              width:  ship.orientation === "ver" ? '100%': "calc(" + (ship.length * 100) + "% + " + (2 * (ship.length - 1)) + "px)",
              height: ship.orientation === "ver" ? "calc(" + (ship.length * 100) + "% + " + (2 * (ship.length - 1)) + "px)": "100%"
            }}
          />
        )
      )}

    </button>
  )
}

function Table({gameState, setGameState}) {
  const list = []
  for (let i = 0; i < 100; i++) {
    list.push(i)
  }

  const mouseMove = (e, isSelected) => {
    // if (isSelected) {

    //   let cell = Array.from(e.currentTarget.children).filter((child) => child.classList.contains("Cell"))[0];
    //   let cellBox = cell.getBoundingClientRect();
    //   let cellSize = {
    //     l: cellBox.right - cellBox.left, 
    //     w: cellBox.bottom - cellBox.top
    //   }
    //   console.log(cellSize)

    //   var rect = e.currentTarget.getBoundingClientRect();
    //   var mousePos = {
    //     x: Math.ceil(e.clientX - rect.x), 
    //     y: Math.ceil(e.clientY - rect.y)
    //   };
    //   var tableSize = {
    //     l: rect.right - rect.left, 
    //     w: rect.bottom - rect.top
    //   };
    //   var periodX = tableSize.l / GRIDSIZE;
    //   var periodY = tableSize.w / GRIDSIZE;
    //   var gridPos = {
    //     x: Math.floor(mousePos.x / periodX), 
    //     y: Math.floor(mousePos.y / periodY)
    //   }

    //   if (Object.is(gridPos.x, -0) || gridPos.x < 0 || gridPos.x >= GRIDSIZE) {
    //     return
    //   } else if (Object.is(gridPos.y, -0) || gridPos.y < 0 || gridPos.y >= GRIDSIZE) {
    //     return
    //   }

    //   console.log(gridPos)
    //   let temp = Array.from(e.currentTarget.children).filter((child) => child.classList.contains("Temp"))[0];
    //   temp.style.left = (gridPos.x * periodX + rect.left) + "px";
    //   temp.style.top = (gridPos.y * periodY + rect.top) + "px";
    // }
  }

  return (
    <div className="Table" onMouseMove={(e) => mouseMove(e, gameState.isSelected)}>
      {list.map(i => 
        <Cell key={i} row={(i - i % 10) / 10} col={i % 10} gameState={gameState} setGameState={setGameState}></Cell>
      )}
    </div>
  );
}

function Boat({gameState, setGameState, length, orientation, index}) {

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

  // // Factor by which to shift the placing ship if it would otherwise be placed off the table
  // var shiftFactorTop = props.row + shipLength - GRIDSIZE;
  // var shiftStringTop  = "calc(-" + (100 * shiftFactorTop) + "% - " + (2 * shiftFactorTop) + "px)";

  // var shiftFactorLeft = props.col + shipLength - GRIDSIZE;
  // var shiftStringLeft  = "calc(-" + (100 * shiftFactorLeft) + "% - " + (2 * shiftFactorLeft) + "px)";

  return (
    <div 
      style={{
        height: orientation === "ver" ? lengthString: '100px',
        width:  orientation === "ver" ? '100px': lengthString,
        backgroundColor: (gameState.isSelected && gameState.selectedShip.index === index) ? "blue": "lightblue"
      }}
      className="Boat" 
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
      board: board,
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
    


  return (
    <div className='BoatSelectContainer'>
      <div className='BoatSelectHorizontal'>
        {gameState.ships.map((boat, index) =>
          (boat.orientation === "ver" && !boat.isPlaced) &&
          <Boat
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
          <Boat
            key={index}
            gameState={gameState} 
            setGameState={setGameState}
            length={boat.length}
            orientation={boat.orientation}
            index={index}
          />
      )}
      </div>


      <button onClick={(e) => rotate(e)}>Rotate</button>
      <button onClick={(e) => reset(e)}>Reset</button>
    </div>
  );
  
}

function Game() {

  const board = []
  for (let i = 0; i < 10; i++) {
    let row = []
    for (let i = 0; i < 10; i++) {
      row.push(0)
    }
    board.push(row)
  }

  const [gameState, setGameState] = useState({
    shotsRemaining: 5,
    board: board,
    isSelected: false,
    ships: [
      {
        length: 2,
        orientation: "ver",
        isPlaced: false,
        position: {
          x: -1,
          y: -1,
        },
      },
      {
        length: 3,
        orientation: "ver",
        isPlaced: false,
        position: {
          x: -1,
          y: -1,
        },
      },
      {
        length: 3,
        orientation: "ver",
        isPlaced: false,
        position: {
          x: -1,
          y: -1,
        },
      },
      {
        length: 4,
        orientation: "hor",
        isPlaced: false,
        position: {
          x: -1,
          y: -1,
        },
      },
      {
        length: 5,
        orientation: "ver",
        isPlaced: false,
        position: {
          x: -1,
          y: -1,
        },
      }
    ],
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
    let tokens = document.querySelectorAll(".Token.staged:not(.hidden)")

    Array.from(tokens).forEach((token) => {
      let row = parseInt(token.getAttribute("row"))
      let col = parseInt(token.getAttribute("col"))
      if (board[row][col] === 1) {
        token.classList.remove("staged")
        token.classList.add("hit")
      } else {
        token.classList.remove("staged")
        token.classList.add("miss")
      }
    })
    setGameState({...gameState, shotsRemaining: 5})
  }

  return (
    <div className='Game'>
      <BoatSelectContianer 
        gameState={gameState} 
        setGameState={setGameState}
      />
      <div id="container">
        <Table 
          gameState={gameState} 
          setGameState={setGameState}
        />
      </div>
      <button onClick={(event) => click(event)}>Fire</button>
    </div>
  );
}

export default Game;
