          
export default function checkHits(d, gameState, setGameState, conState) {

  if (d.type !== 'check-hits') {
    return;
  }

  let newBoard = gameState.playerBoard;

  let res = {
    shots: [],
    sinks: [],
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
}