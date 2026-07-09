import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { GamePageHeader } from "../components/games/GamePageHeader";
import { TicTacToeEngine, type Difficulty, type TicTacToeState } from "../engine/TicTacToeEngine";
import "./TicTacToePage.css";

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "normal", label: "Normal" },
  { value: "impossible", label: "Impossible" },
];

export function TicTacToePage(): ReactElement {
  const engine = useMemo(() => new TicTacToeEngine(), []);
  const [state, setState] = useState<TicTacToeState>(engine.getState());

  useEffect(() => {
    const unsubscribe = engine.subscribe(setState);
    engine.start();
    return () => {
      unsubscribe();
      engine.destroy();
    };
  }, [engine]);

  const statusText = (() => {
    if (state.winner === "draw") return "Tie Game!";
    if (state.winner === state.human) return "You Win!";
    if (state.winner === state.ai) return "You Lose.";
    return state.turn === state.human ? "Your turn" : "Thinking...";
  })();

  return (
    <>
      <GamePageHeader title="Covenant" category="Rite II: Communion" />

      <section className="ttt-layout container">
        <div className="ttt-stage">
          <div className={`ttt-status${state.winner ? " ttt-status-final" : ""}`}>{statusText}</div>

          <div className="ttt-board">
            {state.board.map((cell, index) => {
              const isWinning = state.winningLine?.includes(index) ?? false;
              return (
                <button
                  key={index}
                  type="button"
                  className={`ttt-cell${cell ? ` ttt-${cell.toLowerCase()}` : ""}${isWinning ? " ttt-winning" : ""}`}
                  onClick={() => engine.playHumanMove(index)}
                  disabled={!!cell || !!state.winner || state.turn !== state.human}
                  aria-label={`Cell ${index + 1}${cell ? `, ${cell}` : ", empty"}`}
                >
                  {cell}
                </button>
              );
            })}
          </div>

          <div className="panel-buttons ttt-buttons">
            <button type="button" className="primary-btn" onClick={() => engine.reset()}>
              New Game
            </button>
          </div>
        </div>

        <aside className="ttt-panel">
          <div className="stat-card">
            <span>Scoreboard</span>
            <div className="scoreboard">
              <div>
                <strong>{state.wins}</strong>
                <small>Wins</small>
              </div>
              <div>
                <strong>{state.draws}</strong>
                <small>Draws</small>
              </div>
              <div>
                <strong>{state.losses}</strong>
                <small>Losses</small>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <span>Difficulty</span>
            <div className="difficulty-group">
              {DIFFICULTIES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`difficulty-btn${state.difficulty === option.value ? " difficulty-active" : ""}`}
                  onClick={() => engine.setDifficulty(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="keybind-help">
            <h4>How it works</h4>
            <p>
              You play as O, the engine plays as X using a minimax search. On Impossible
              it always plays optimally and can never be beaten, only tied.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
