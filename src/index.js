import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Table from './Table.js';
import './Table.css';
import reportWebVitals from './reportWebVitals';
import { useState } from 'react';

let board = []
for (let i = 0; i < 10; i++) {
  let row = []
  for (let i = 0; i < 10; i++) {
    row.push(i % 2)
  }
  board.push(row)
}
console.log(board)

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
}


function TestButton(props) {
  const click = (e, props) => {
    props.setState({
      value: props.state.value + 1
    })
  }

  return (
    <button className="TestButton" onClick={(e) => click(e, props)}>
      {props.state.value}
    </button>
  )
}

function Test() {
  const [state, setState] = useState({
    value: 0
  })
  // const click = (e) => {
  //   setState({
  //     value: state.value + 1
  //   })
  // }

  return (
    <div className='Test'>
      {/* <Test2 state={state} setState={setState}/> */}
      {/* <button onClick={(e) => click(e)}>{state.value}</button> */}
      <TestButton state={state} setState={setState}/>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <div id="container">
      <Table />
    </div>
    <button onClick={(event) => click(event)}>Fire</button> */}
    <Test/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
