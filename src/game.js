import './game.css';
import { useState, useRef, useEffect } from 'react';
import ConnectionManager from './components/ConnectionManager';

const MAXSHOTS = 5
const GRIDSIZE = 10
const NUMSHIPS = 5

function conSend(conState, type, data) {

  // Ensure connection is open
  if (conState.con !== null) {

    conState.con.send({
      type: type,
      info: data,
    });
  }
}

function setConRecieve(conState, type, callback) {

  // Ensure connection is open
  if (conState.con !== null) {

    // Recieve hook
    conState.con.on("data", (d) => {

      // Only consider data from sends of the correct type
      if (d.type === type) {

        callback(d);
      }
    });
  }
}


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

function Cell({cellPos, gameState, setGameState}) {
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
        x: (orientation === "ver" ? cellPos.x: cellPos.x + baseShift),
        y: (orientation === "ver" ? cellPos.y + baseShift : cellPos.y)
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
      style={{position: "relative"}}
    >

      {/* Ghost ship when placing */}
      {(gameState.isSelected && cellPos.x === gameState.selectedShip.position.x && cellPos.y === gameState.selectedShip.position.y) &&
        <SelectedShip ship={gameState.selectedShip} canPlaceShip={canPlaceShip()}/>
      }

      {/* Placed ships */}
      {gameState.ships.map((ship, i) => 
        ((cellPos.x === ship.position.x && cellPos.y === ship.position.y) &&
          <PlacedShip key={i} ship={ship}/>
        )
      )}

      {/* Enemy tokens on your board */}
      {gameState.playerBoard[cellPos.y][cellPos.x] % 3 !== 0 &&
        <div
          className='Token'
          style={{
            position: "absolute",
            zIndex: 1,
            backgroundColor:
              (gameState.playerBoard[cellPos.y][cellPos.x] % 3 === 1) ? (gameState.playerBoard[cellPos.y][cellPos.x] >= 3) ?
              "red" :  "white" : "blue"
          }}
        />
      }
    </button>
  )
}

function Table({gameState, setGameState}) {
  const rows = [];
  const cols = [];
  for (let i = 0; i < GRIDSIZE; i++) {
    rows.push(i);
    cols.push(i);
  }

  return (
    <div className="Table">
      {rows.map(i => 
        cols.map(j => 
          <Cell key={GRIDSIZE * i + j} cellPos={{x: j, y: i}} gameState={gameState} setGameState={setGameState}></Cell>
        )
      )}
    </div>
  );
}

function EnemyCell({cellPos, gameState, setGameState, enabled}) {
  const [isHovered, setIsHovered] = useState(false);
  const shotIndex = useRef(-1);

  const click = (e) => {

    // Token placed on previous turn
    if (gameState.enemyBoard[cellPos.y][cellPos.x] > 1) {
      console.log("Can't remove token", cellPos);
    // Token placed on this turn
    } else if (gameState.enemyBoard[cellPos.y][cellPos.x] > 0) {

      if (gameState.shotsRemaining >= MAXSHOTS) {
        console.log("You shouldn't see this, shots remaining can't exceed", MAXSHOTS);
      } else {

        // Free space in shot list to be overwritten
        let updatedIndicies = gameState.freeShotIndicies;
        updatedIndicies.push(shotIndex.current);
        shotIndex.current = -1;

        // Remove token from visual board
        let newBoard = gameState.enemyBoard;
        newBoard[cellPos.y][cellPos.x] = 0;

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
        newShots[shotIndex.current] = cellPos;

        // Add token to visual board
        let newBoard = gameState.enemyBoard;
        newBoard[cellPos.y][cellPos.x] = 1;

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
    console.log(gameState.shots);
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
      onClick={(event) => enabled && click(event)} 
      onMouseEnter={(e) => enabled && mouseEnter(e)} 
      onMouseOut={(e) => enabled && mouseExit(e)}

      style={{
        cursor: enabled ? "pointer" : "unset",
        position: "relative"
      }}
    >

      {gameState.sunkShips.map((ship, i) => 
        ((cellPos.x === ship.position.x && cellPos.y === ship.position.y) &&
          <PlacedShip key={i} ship={ship}/>
        )
      )}

      {/* Ghost token to show where to place */}
      {isHovered &&
        <div 
          className='Token'
          style={{backgroundColor: "orange"}}
        /> 
      }

      {!isHovered && gameState.enemyBoard[cellPos.y][cellPos.x] > 0 &&
        <div
          className='Token'
          style={{
            backgroundColor: 
              (gameState.enemyBoard[cellPos.y][cellPos.x] === 1) ? "yellow" :
              (gameState.enemyBoard[cellPos.y][cellPos.x] === 2) ? "white" :
              (gameState.enemyBoard[cellPos.y][cellPos.x] === 3) ? "red" :
              "blue",
            position: "absolute",
            zIndex: 1,
          }}
        />
      }

    </button>
  )
}

function EnemyTable({gameState, setGameState, enabled}) {
  const rows = [];
  const cols = [];
  for (let i = 0; i < GRIDSIZE; i++) {
    rows.push(i);
    cols.push(i);
  }

  return (
    <div className="Table">
      {rows.map(i => 
        cols.map(j => 
          <EnemyCell key={GRIDSIZE * i + j} cellPos={{x: j, y: i}} gameState={gameState} setGameState={setGameState} enabled={enabled}/>
        )
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

function BoatSelectContainer({gameState, setGameState, conState}) {

  const oppWaiting = useRef(false);

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

    const board = []
    for (let i = 0; i < 10; i++) {
      let row = new Array(10).fill(0);
      board.push(row);
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
    if (oppWaiting.current === true) {
      // Opponent is already done placing ships, start the game
      // Tell opponent to start the game
      conState.con.send({
        type: "start-game",
        info: {},
      });

      // Start game here 
      setGameState({
        ...gameState,
        phase: "firing"
      });
  
      console.table(gameState.playerBoard);

    } else {
      // Tell opponent that user is done placing ships
      // Wait for opponent
      conState.con.send({
        type: "ships-placed",
        info: {},
      });
    }
  }

  useEffect(() => {
    if (conState.con !== null) {
      conState.con.on("data", (d) => {
        if (d.type === "ships-placed") {
          oppWaiting.current = true;
          console.log("Other player waiting");
          // Show some indication to user here

        } else if (d.type === "start-game") {
          // Other player is ready, now start game here
          setGameState({
            ...gameState,
            phase: "firing"
          });
      
          console.table(gameState.playerBoard);
        }
      });
    }
  });

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

function ShotContainer({gameState, setGameState, conState, setConState}) {

  function fire(e) {
    conSend(conState, "check-hits", gameState.shots);
  }

  return (
    <div className='ShotContainer'>
      {gameState.playerTurn === conState.playerNum &&
        [...Array(gameState.shotsRemaining)].map((x, i) => <div key={i} className='token-inicator'></div>)
      }
      {gameState.playerTurn === conState.playerNum ? 
        <Table gameState={gameState} setGameState={setGameState}/> : 
        <EnemyTable gameState={gameState} setGameState={setGameState} enabled={false}/>
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

  const [conState, setConState] = useState({
    peer: null,
    con: null,
    conID: "",
    myID: "",
    status: "disconnected",
    playerNum: -1,
    nextSendID: 0,
  });

  const [gameState, setGameState] = useState(() => {
    // Make empty board
    const board = []
    for (let i = 0; i < 10; i++) {
      let row = new Array(10).fill(0);
      board.push(row);
    }

    const enemyBoard = []
    for (let i = 0; i < 10; i++) {
      let row = new Array(10).fill(0);
      enemyBoard.push(row);
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

    let shots = [];
    let freeShotIndicies = [];
    for (let i = 0; i < NUMSHIPS; i++) {
      shots.push({x: -1, y: -1});
      freeShotIndicies.push(i);
    }

    const state = {
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

      shots: shots,
      freeShotIndicies: freeShotIndicies,

      enemyBoard: enemyBoard,
      sunkShips: [],

      nextSendID: 0,
    }

    return state;
  });

  useEffect(() => {
    if (conState.con != null) {

      // Recieve data
      conState.con.on("data", (d) => {
  
        if (d.type === "check-hits") {
  
          let newBoard = gameState.playerBoard;
  
          let res = {
            shots: [],
            sinks: []
          };
  
          d.info.forEach((el) => {
            newBoard[el.y][el.x] >= 3 ? res.shots.push("hit") : res.shots.push("miss");
            newBoard[el.y][el.x] += 1;
          });
  
          gameState.ships.forEach((el) => {
            let isSunk = true;
            for(let i = 0; i < el.length; i++) {
              if (el.orientation === "hor") {
                if (newBoard[el.position.y][el.position.x + i] % 3 === 0) {
                  isSunk = false;
                }
              } else {
                if (newBoard[el.position.y + i][el.position.x ] % 3 === 0) {
                  isSunk = false;
                }
              }
            }
            if (isSunk) {
              res.sinks.push(el);
            }
          });

          conState.con.send({
            type: "return-hits",
            id: gameState.nextSendID,
            info: res,
          });

          setGameState({
            ...gameState,
            playerBoard: newBoard,
            playerTurn: (gameState.playerTurn + 1) % 2,
          });

        } else if (d.type === "return-hits") {
  
          // Record results on board
          let newBoard = gameState.enemyBoard;
          d.info.shots.forEach((e, i) => {
            let pos = gameState.shots[i];
            newBoard[pos.y][pos.x] = (e === "miss" ? 2 : 3);
          });
      
          let newSunkList = d.info.sinks;

          // Reset list
          let freeShotIndicies = [];
          for (let i = 0; i < NUMSHIPS; i++) {
            freeShotIndicies.push(i);
          }

          setGameState({
            ...gameState,
            enemyBoard: newBoard,
            shotsRemaining: MAXSHOTS,
            freeShotIndicies: freeShotIndicies,
            playerTurn: (gameState.playerTurn + 1) % 2,
            sunkShips: newSunkList,
          });
        }
      });
    }

    return () => {
      if (conState.con != null) {
        conState.con.off("data");
      }
    }
  }, [gameState, conState.con]);


  console.log(gameState);
  return (
    <div className='Game'>
      {conState.status !== "connected" &&
        <ConnectionManager conState={conState} setConState={setConState}></ConnectionManager>
      }

      <div id="table-container">
        {(gameState.phase === "placing" || (gameState.phase === "firing" && conState.playerNum !== gameState.playerTurn)) ?
          <Table 
            gameState={gameState} 
            setGameState={setGameState}
          />
        :
          <EnemyTable 
            gameState={gameState} 
            setGameState={setGameState}
            enabled={true}
          />
        }

      </div>
      {(gameState.phase === "placing") ?
        <BoatSelectContainer 
          gameState={gameState} 
          setGameState={setGameState}
          conState={conState}
        />
      :
        <ShotContainer 
          gameState={gameState} 
          setGameState={setGameState}
          conState={conState}
          setConState={setConState}
        />
      }
    </div>
  );
}

export default Game;
