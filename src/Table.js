import './Table.css';

function Cell(props) {
  const click = (a, b) => {
    let button = b.target;
    if (button.classList.contains("black")) {
      button.classList.remove("black")
    } else {
      button.classList.add("black")
    }
  }

  return (
    <button className="Cell" onClick={(event) => click(props.num, event)}></button>
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
        <Cell key={i} num={i}></Cell>
      )}
    </div>
  );
}

export default Table;
