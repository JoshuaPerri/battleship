import './game.css';
import { useState } from 'react';

let max_shots = 5

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
  const click = (e) => {
    let button = e.currentTarget
    // Search children of button to get token
    let token = Array.from(button.children).filter((child) => child.classList.contains("Token"))[0];

    if (token.classList.contains("hidden")) {
      if (props.gameState.shotsRemaining > 0) {
        token.classList.remove("hidden")
        props.onStage();
      }
    } else {
      if (props.gameState.shotsRemaining < max_shots) {
        token.classList.add("hidden")
        props.onUnstage();
      }
    }
  }

  return (
    <button className="Cell" onClick={(event) => click(event)}>
      <div className='Token staged hidden' col={props.col} row={props.row}></div>
    </button>
  )
}

function Table({gameState, onStage, onUnstage}) {
  const list = []
  for (let i = 0; i < 100; i++) {
    list.push(i)
  }

  return (
    <div className="Table">
      {list.map(i => 
        <Cell key={i} row={(i - i % 10) / 10} col={i % 10} gameState={gameState} onStage={onStage} onUnstage={onUnstage}></Cell>
      )}
    </div>
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
  console.log(board)

  const [gameState, setGameState] = useState({
    shotsRemaining: 5,
    board: board
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
