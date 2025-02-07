
const MAXSHOTS = 5;
const NUMSHIPS = 5;

export default function returnHits(d, gameState, setGameState, conState) {

  if (d.type !== "return-hits") {
    return;
  }

  // Record results on board
  let newBoard = gameState.enemyBoard;
  d.info.shots.forEach((e, i) => {
    let pos = gameState.shots[i];
    newBoard[pos.y][pos.x] = (e === "miss" ? 2 : 3);
  });

  let newSunkList = d.info.sinks;

  // Reset list
  let freeShotIndicies = [];
  for (let i = 0; i < NUMSHIPS; i++) {
    freeShotIndicies.push(i);
  }

  setGameState({
    ...gameState,
    enemyBoard: newBoard,
    shotsRemaining: MAXSHOTS,
    freeShotIndicies: freeShotIndicies,
    playerTurn: (gameState.playerTurn + 1) % 2,
    sunkShips: newSunkList,
  });

  // If player has sunk all the ships, end the game
  if (newSunkList.length === NUMSHIPS) {
    conState.con.send({
      type: "end-game",
      info: {},
    });

    setGameState({
      ...gameState,
      winner: conState.playerNum,
      phase: "end",
    });
  }
}