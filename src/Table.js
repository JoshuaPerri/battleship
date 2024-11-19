import './Table.css';

function toggleClass(element, className) {
  element.classList.contains(className) ? element.classList.remove(className) : element.classList.add(className)
}

function Cell(props) {
  const click = (a, b) => {
    let button = b.currentTarget
    // Search children of button to get token
    let token = Array.from(button.children).filter((child) => child.classList.contains("Token"))[0];
    toggleClass(token, "hidden")
  }

  return (
    <button className="Cell" onClick={(event) => click(props.num, event)}>
      <div className='Token hidden'></div>
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
        <Cell key={i} num={i}></Cell>
      )}
    </div>
  );
}

export default Table;
