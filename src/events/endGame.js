
export default function endGame(d, gameState, setGameState, conState) {
  if (d.type !== 'end-game') {
    return;
  }

  setGameState({
    ...gameState,
    winner: (conState.playerNum + 1) % 2,
    phase: "end",
  });
}