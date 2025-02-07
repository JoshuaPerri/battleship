
export default function setPlayerData(d, gameState, setGameState) {

  if (d.type !== 'set-player-data') {
    return;
  }

  setGameState({
    ...gameState,
    enemyName: d.data.playerName,
    enemyColour: d.data.playerColour,
  });
}