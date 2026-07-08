import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { GamePageHeader } from "../components/games/GamePageHeader";
import { LifeEngine, type LifePattern, type LifeState } from "../engine/LifeEngine";
import "./NeuralGridPage.css";

// Fixed cell size in pixels, mirroring the original vanilla implementation.
// Grid dimensions are then derived from the available viewport width/height
// so the board always renders at a definite, non-zero size instead of
// relying on fractional ("1fr") columns, which collapse to 0px when the
// grid items (empty <button> cells) have no intrinsic content size.
const DESKTOP_CELL_SIZE = 20;
const MOBILE_CELL_SIZE = 14;
const CELL_GAP = 2;
const MIN_COLS = 16;
const MIN_ROWS = 12;
const MAX_COLS = 50;
const MAX_ROWS = 28;

function computeGridDimensions(): { rows: number; cols: number; cellSize: number } {
  if (typeof window === "undefined") {
    return { rows: MIN_ROWS, cols: MIN_COLS, cellSize: DESKTOP_CELL_SIZE };
  }

  const isMobile = window.innerWidth < 768;
  const cellSize = isMobile ? MOBILE_CELL_SIZE : DESKTOP_CELL_SIZE;

  const availableWidth = Math.min(window.innerWidth - 80, 1000);
  const availableHeight = window.innerHeight - 420;

  const cols = Math.min(
    MAX_COLS,
    Math.max(MIN_COLS, Math.floor(availableWidth / (cellSize + CELL_GAP))),
  );
  const rows = Math.min(
    MAX_ROWS,
    Math.max(MIN_ROWS, Math.floor(availableHeight / (cellSize + CELL_GAP))),
  );

  return { rows, cols, cellSize };
}

const PATTERNS: { value: LifePattern; label: string }[] = [
  { value: "glider", label: "Glider" },
  { value: "pulsar", label: "Pulsar" },
  { value: "glider-gun", label: "Glider Gun" },
];

export function NeuralGridPage(): ReactElement {
  const [dimensions] = useState(computeGridDimensions);
  const engine = useMemo(
    () => new LifeEngine(dimensions.rows, dimensions.cols),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [state, setState] = useState<LifeState>(engine.getState());

  useEffect(() => {
    const unsubscribe = engine.subscribe(setState);
    engine.start();
    return () => {
      unsubscribe();
      engine.destroy();
    };
  }, [engine]);

  const cellSizeVar = { "--cell-size": `${dimensions.cellSize}px` } as React.CSSProperties;

  return (
    <>
      <GamePageHeader title="Abyssal Bloom" category="Rite III \u2014 Shedding" />

      <section className="grid-layout container">
        <div className="grid-stage">
          <div className="life-grid-scroll">
            <div
              className="life-grid"
              style={{
                ...cellSizeVar,
                gridTemplateColumns: `repeat(${dimensions.cols}, var(--cell-size))`,
                gridTemplateRows: `repeat(${dimensions.rows}, var(--cell-size))`,
              }}
              role="grid"
              aria-label="Cellular automaton board"
            >
              {state.grid.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    className={`life-cell${cell ? " life-cell-alive" : ""}`}
                    onClick={() => engine.toggleCell(r, c)}
                    aria-label={`Cell row ${r + 1} column ${c + 1}${cell ? ", alive" : ", dead"}`}
                  />
                )),
              )}
            </div>
          </div>

          <div className="panel-buttons grid-buttons">
            <button type="button" className="primary-btn" onClick={() => engine.toggle()}>
              {state.playing ? "Pause" : "Play"}
            </button>
            <button type="button" className="glass-btn" onClick={() => engine.randomize()}>
              Randomize
            </button>
            <button type="button" className="glass-btn" onClick={() => engine.clear()}>
              Clear
            </button>
          </div>
        </div>

        <aside className="grid-panel">
          <div className="stat-row">
            <div className="stat-card small">
              <span>Generation</span>
              <strong>{state.generation}</strong>
            </div>
            <div className="stat-card small">
              <span>Population</span>
              <strong>{state.population}</strong>
            </div>
          </div>

          <div className="stat-card">
            <span>Simulation Speed</span>
            <input
              type="range"
              min={40}
              max={400}
              step={10}
              value={440 - state.speedMs}
              onChange={(event) => engine.setSpeed(440 - Number(event.target.value))}
              aria-label="Simulation speed"
            />
            <small className="speed-label">{Math.round(1000 / state.speedMs)} generations / sec</small>
          </div>

          <div className="stat-card">
            <span>Seed Patterns</span>
            <div className="pattern-group">
              {PATTERNS.map((pattern) => (
                <button
                  key={pattern.value}
                  type="button"
                  className="glass-btn pattern-btn"
                  onClick={() => engine.stampPattern(pattern.value)}
                >
                  {pattern.label}
                </button>
              ))}
            </div>
          </div>

          <div className="keybind-help">
            <h4>How it works</h4>
            <p>
              Any live cell with two or three neighbours survives. Any dead cell with
              exactly three live neighbours becomes alive. Every other cell dies or stays
              empty. Click any cell to toggle it, even while the simulation is running.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
