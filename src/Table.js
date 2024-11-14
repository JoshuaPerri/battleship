import './Table.css';

function Table() {
  const list = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  return (
    <div className="Table">
      {list.map((i) => <div>{i}</div>)}
    </div>
  );
}

export default Table;
