import './game.css';
import { useState } from 'react';

let max_shots = 5
const GRIDSIZE = 10

function toggleClass(element, className) {
  if (element.classList.contains(className)) {
    element.classList.remove(className)
    return true
  } else {
    element.classList.add(className)
    return false
  }
}

function Cell(props) {
  const [hasToken, setHasToken] = useState(false)
  // const [tokenFired, setTokenFired] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const click = (e) => {
    // let button = e.currentTarget
    // Search children of button to get token
    // let token = Array.from(button.children).filter((child) => child.classList.contains("Token"))[0];

    if (!hasToken) {
      if (props.gameState.shotsRemaining > 0) {
        props.onStage();
        setHasToken(true);
      }
    } else {
      if (props.gameState.shotsRemaining < max_shots) {
        props.onUnstage();
        setHasToken(false);
      }
    }
  }

  const mouseEnter = (e) => {
    if (props.gameState.isSelected) {
      setIsHovered(true)
    }
  }

  const mouseExit = (e) => {
    if (props.gameState.isSelected) {
      setIsHovered(false)
    }
  }

  return (
    <button className="Cell" onClick={(event) => click(event)} onMouseEnter={(e) => mouseEnter(e)} onMouseOut={(e) => mouseExit(e)}>
      {/* <div className='Token staged hidden' col={props.col} row={props.row}></div> */}
      { hasToken && 
        <div className='Token staged' col={props.col} row={props.row}/>
      }
      {(isHovered && props.gameState.isSelected) && 
        <div className='Temp'/>
      }
    </button>
  )
}

function Table({gameState, onStage, onUnstage}) {
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
        <Cell key={i} row={(i - i % 10) / 10} col={i % 10} gameState={gameState} onStage={onStage} onUnstage={onUnstage}></Cell>
      )}
    </div>
  );
}

function Boat({gameState, onSelect, onDeselect}) {

  const click = (e) => {
    var target = e.currentTarget;
    if (gameState.isSelected) {
      target.classList.remove("selected");
      onDeselect()
    } else {
      target.classList.add("selected");
      onSelect()
    }
  }

  return (
    <div 
      className="Boat" 
      onClick={(e) => click(e)}
    />
  );
}

function Game() {

  const board = []
  for (let i = 0; i < 10; i++) {
    let row = []
    for (let i = 0; i < 10; i++) {
      row.push(i % 2)
    }
    board.push(row)
  }
  // console.log(board)

  const [gameState, setGameState] = useState({
    shotsRemaining: 5,
    board: board,
    isSelected: false
  })

  const click = (e) => {
    let tokens = document.querySelectorAll(".Token.staged:not(.hidden)")

    Array.from(tokens).forEach((token) => {
      let row = parseInt(token.getAttribute("row"))
      let col = parseInt(token.getAttribute("col"))
      if (board[row][col] == 1) {
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
      <Boat 
        gameState={gameState} 
        onSelect={() =>   setGameState({...gameState, isSelected: true})}
        onDeselect={() => setGameState({...gameState, isSelected: false})}
      />
      <div id="container">
        <Table 
          gameState={gameState} 
          onStage={() =>   setGameState({...gameState, shotsRemaining: gameState.shotsRemaining - 1})} 
          onUnstage={() => setGameState({...gameState, shotsRemaining: gameState.shotsRemaining + 1})} 
        />
      </div>
      <button onClick={(event) => click(event)}>Fire</button>
    </div>
  );
}

export default Game;
