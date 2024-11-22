import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Game from './game.js';
import './game.css';
import reportWebVitals from './reportWebVitals';
import { useState } from 'react';

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

  return (
    <div className='Test'>
      <TestButton state={state} setState={setState}/>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Game/>
    {/* <Test/> */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
