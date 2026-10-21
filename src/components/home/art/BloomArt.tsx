import type { ReactElement } from "react";
import { useEffect, useId, useState } from "react";
import { useInterval } from "../../../hooks/useInterval";

interface BloomArtProps {
  /** When true the pulsar breathes and its dead cells fade like afterimages. */
  live: boolean;
}

const ROWS = 17;
const COLS = 15;
const CELL = 10;
const INSET = 0.7;
const SIZE = CELL - INSET * 2;
const TICK_MS = 420;
/** Share of brightness a dead cell keeps each generation. Lower dissolves faster. */
const AFTERGLOW = 0.55;

/** The "Pulsar" seed from LifeEngine, centred in the grid. */
const PULSAR: [number, number][] = [
  [0, 2], [0, 3], [0, 4], [0, 8], [0, 9], [0, 10],
  [2, 0], [2, 5], [2, 7], [2, 12],
  [3, 0], [3, 5], [3, 7], [3, 12],
  [4, 0], [4, 5], [4, 7], [4, 12],
  [5, 2], [5, 3], [5, 4], [5, 8], [5, 9], [5, 10],
  [7, 2], [7, 3], [7, 4], [7, 8], [7, 9], [7, 10],
  [8, 0], [8, 5], [8, 7], [8, 12],
  [9, 0], [9, 5], [9, 7], [9, 12],
  [10, 0], [10, 5], [10, 7], [10, 12],
  [12, 2], [12, 3], [12, 4], [12, 8], [12, 9], [12, 10],
];
const ROW_OFFSET = 2;
const COL_OFFSET = 1;

interface Colony {
  alive: Uint8Array;
  /** 1 while alive, then decays towards 0 once the cell dies. */
  glow: Float32Array;
}

function seed(): Colony {
  const alive = new Uint8Array(ROWS * COLS);
  const glow = new Float32Array(ROWS * COLS);
  for (const [row, col] of PULSAR) {
    const index = (row + ROW_OFFSET) * COLS + (col + COL_OFFSET);
    alive[index] = 1;
    glow[index] = 1;
  }
  return { alive, glow };
}

/** Conway's rules on a bounded grid: the same ruleset LifeEngine runs. */
function advance(colony: Colony): Colony {
  const alive = new Uint8Array(ROWS * COLS);
  const glow = new Float32Array(ROWS * COLS);

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      let neighbours = 0;
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (dr === 0 && dc === 0) continue;
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < ROWS && c >= 0 && c < COLS) neighbours += colony.alive[r * COLS + c];
        }
      }

      const index = row * COLS + col;
      const lives = colony.alive[index] ? neighbours === 2 || neighbours === 3 : neighbours === 3;
      alive[index] = lives ? 1 : 0;
      glow[index] = lives ? 1 : colony.glow[index] * AFTERGLOW < 0.06 ? 0 : colony.glow[index] * AFTERGLOW;
    }
  }

  return { alive, glow };
}

export function BloomArt({ live }: BloomArtProps): ReactElement {
  const glowId = `bl-glow-${useId().replace(/:/g, "")}`;
  const [colony, setColony] = useState<Colony>(seed);

  // Restart from the seed whenever the slide comes into focus.
  useEffect(() => {
    if (live) setColony(seed());
  }, [live]);

  useInterval(() => setColony(advance), live ? TICK_MS : null);

  const empty: ReactElement[] = [];
  const alive: ReactElement[] = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const index = row * COLS + col;
      const x = col * CELL + INSET;
      const y = row * CELL + INSET;

      empty.push(<rect key={index} className="bl-empty" x={x} y={y} width={SIZE} height={SIZE} rx="1" />);
      alive.push(
        <rect
          key={index}
          className="bl-alive"
          x={x}
          y={y}
          width={SIZE}
          height={SIZE}
          rx="1"
          opacity={colony.glow[index]}
        />,
      );
    }
  }

  return (
    <svg
      className="art art-bloom"
      viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
    >
      <defs>
        <filter id={glowId} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="bl-rings" fill="none">
        <circle cx={(COLS * CELL) / 2} cy={(ROWS * CELL) / 2} r="26" />
        <circle cx={(COLS * CELL) / 2} cy={(ROWS * CELL) / 2} r="50" />
        <circle cx={(COLS * CELL) / 2} cy={(ROWS * CELL) / 2} r="76" />
        <circle cx={(COLS * CELL) / 2} cy={(ROWS * CELL) / 2} r="104" />
      </g>

      <g>{empty}</g>
      <g filter={`url(#${glowId})`}>{alive}</g>
    </svg>
  );
}
