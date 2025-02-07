import './game.css';
import { useState, useRef, useEffect } from 'react';
import ConnectionManager from './components/ConnectionManager';
import Board from './components/Board'

import setPlayerData from './events/setPlayerData';
import checkHits from './events/checkHits';
import returnHits from './events/returnHits';
import endGame from './events/endGame';

const MAXSHOTS = 5
const GRIDSIZE = 10
const NUMSHIPS = 5

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
    if (conState.con !== null) {

      conState.con.send({
        type: "check-hits",
        info: gameState.shots,
      });
    }
  }

  return (
    <div className='ShotContainer'>

      <Board 
        gameState={gameState} 
        setGameState={setGameState} 
        enabled={false} 
        type={gameState.playerTurn === conState.playerNum ? "player" : "enemy"}
      />

      <button
        className='shot-fire-button'
        onClick={(e) => fire(e)}
      >
        Fire
      </button>

      <div
        style={{
          display:"flex",
          flexDirection:"row",
        }}
      >
        {gameState.playerTurn === conState.playerNum &&
          [...Array(gameState.shotsRemaining)].map((x, i) => <div key={i} className='token-inicator'></div>)
        }
      </div>
    </div>
  );
}

function InfoBar({gameState, conState}) {
  return(
    <div className='InfoBar'>
      {
        conState.playerNum === -1 ? <p>Connect to an opponent</p> :
        gameState.phase === "placing" ? <p>Place your ships</p> :
        gameState.playerTurn === conState.playerNum ? <p style={{margin:"0px"}}>It's your turn</p> :
        <p style={{margin:"0px"}}>It's your opponent's turn</p>
      }
      <p>{gameState.enemyName} {gameState.enemyColour}</p>
    </div>
  )
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
      winner: -1,
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
      enemyName: "default",
      enemyColour: "#000000",
      sunkShips: [],

      nextSendID: 0,
    }

    return state;
  });

  useEffect(() => {
    if (conState.con != null) {

      conState.con.on("data", (d) => {
        setPlayerData(d, gameState, setGameState);
        checkHits(d, gameState, setGameState, conState);
        returnHits(d, gameState, setGameState, conState);
        endGame(d, gameState, setGameState, conState);
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
    <div className='container'>
      <div className='Game'>
        <div style={{gridColumn:"1/3"}}>
          <InfoBar gameState={gameState} conState={conState}/>
        </div>

        {conState.status !== "connected" &&
          <ConnectionManager conState={conState} setConState={setConState}></ConnectionManager>
        }

        <div id="table-container">
          {(gameState.phase === "placing" || (gameState.phase === "firing" && conState.playerNum !== gameState.playerTurn)) ?
            <Board gameState={gameState} setGameState={setGameState} enabled={true} type={"player"}/> :
            <Board gameState={gameState} setGameState={setGameState} enabled={true} type={"enemy"}/>
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
        {gameState.phase === "end" && 
          <div
            style={{
              width: "100%",
              height: "100%",
            
              boxSizing: "border-box",
            
              padding: "20px",
            
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            
              background: "rgb(0 0 0 / 40%)",
            
              position: "absolute",
            
              left: "0px",
              top: "0px",
            
              zIndex: 2,
            }}
          >
            <div
              style={{
                backgroundColor: "white",

                width: "60%",
                
                padding: "50px",
                boxSizing: "border-box",
              
                border: "1px solid gray",
                borderRadius: "5px",
              
                display: "flex",
                flexDirection: "column",
              }}
            >
              {gameState.winner === conState.playerNum ?
                <h1>You Win!</h1> :
                <h1>You Lose...</h1>
              }
            </div>
          </div>
        }
      </div>
    </div>
    
  );
}

export default Game;
