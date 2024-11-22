import './Table.css';
import { useState } from 'react';

let max_shots = 5
let shots_remaining = max_shots

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
      if (shots_remaining > 0) {
        shots_remaining--
        token.classList.remove("hidden")
      }
    } else {
      if (shots_remaining < max_shots) {
        shots_remaining++
        token.classList.add("hidden")
      }
    }
  }

  return (
    <button className="Cell" onClick={(event) => click(event)}>
      <div className='Token staged hidden' col={props.col} row={props.row}></div>
    </button>
  )
}

function Table() {
  const list = []
  for (let i = 0; i < 100; i++) {
    list.push(i)
  }
  return (
    <div className="Table">
      {list.map(i => 
        <Cell key={i} row={(i - i % 10) / 10} col={i % 10}></Cell>
      )}
    </div>
  );
}

export default Table;
