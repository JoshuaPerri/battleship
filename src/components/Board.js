import PlayerTile from "./PlayerTile";
import EnemyTile  from "./EnemyTile";

import '../styles/Board.css';

const GRIDSIZE = 10;

export default function Board({gameState, setGameState, enabled, type}) {
  const rows = [];
  const cols = [];
  for (let i = 0; i < GRIDSIZE; i++) {
    rows.push(i);
    cols.push(i);
  }

  return (
    <div className="Board">
      {rows.map(i => 
        cols.map(j => 
          type === "player" ? 
            <PlayerTile key={GRIDSIZE * i + j} tilePos={{x: j, y: i}} gameState={gameState} setGameState={setGameState}/> :
            <EnemyTile  key={GRIDSIZE * i + j} tilePos={{x: j, y: i}} gameState={gameState} setGameState={setGameState} enabled={enabled}/>
        )
      )}
    </div>
  );
}