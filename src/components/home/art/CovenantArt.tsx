import type { ReactElement } from "react";
import { useEffect, useId, useState } from "react";
import { useInterval } from "../../../hooks/useInterval";

interface CovenantArtProps {
  /** When true the game plays itself out move by move; otherwise the finished board is shown. */
  live: boolean;
}

type Mark = "X" | "O";

/** A complete, legal game that ends in a draw: the pact held on both sides. */
const MOVES: { cell: number; mark: Mark }[] = [
  { cell: 4, mark: "X" },
  { cell: 0, mark: "O" },
  { cell: 2, mark: "X" },
  { cell: 6, mark: "O" },
  { cell: 3, mark: "X" },
  { cell: 5, mark: "O" },
  { cell: 7, mark: "X" },
  { cell: 1, mark: "O" },
  { cell: 8, mark: "X" },
];

const TICK_MS = 650;
const SEAL_AT = MOVES.length + 1;
const CYCLE_END = MOVES.length + 5;
const PITCH = 32;
const ORIGIN = 3.5;
const CELL = 29;
const CENTER = 18;

function centerOf(cell: number): { cx: number; cy: number } {
  return { cx: CENTER + (cell % 3) * PITCH, cy: CENTER + Math.floor(cell / 3) * PITCH };
}

export function CovenantArt({ live }: CovenantArtProps): ReactElement {
  const glowId = `cv-glow-${useId().replace(/:/g, "")}`;
  const [step, setStep] = useState(MOVES.length);

  // Start from an empty board whenever the slide comes into focus.
  useEffect(() => {
    if (live) setStep(0);
  }, [live]);

  useInterval(() => setStep((value) => (value >= CYCLE_END ? 0 : value + 1)), live ? TICK_MS : null);

  const shown = live ? step : MOVES.length;
  const sealed = !live || step >= SEAL_AT;

  return (
    <svg
      className={`art art-covenant${sealed ? " is-sealed" : ""}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
    >
      <defs>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect className="cv-seal" x="0.8" y="0.8" width="98.4" height="98.4" rx="2" />

      {Array.from({ length: 9 }, (_, cell) => (
        <rect
          key={cell}
          className="cv-cell"
          x={ORIGIN + (cell % 3) * PITCH}
          y={ORIGIN + Math.floor(cell / 3) * PITCH}
          width={CELL}
          height={CELL}
          rx="1.5"
        />
      ))}

      <g filter={`url(#${glowId})`} fill="none" strokeLinecap="round">
        {MOVES.map(({ cell, mark }, index) => {
          const { cx, cy } = centerOf(cell);
          const className = `cv-mark cv-${mark.toLowerCase()}${index < shown ? " is-drawn" : ""}`;

          return mark === "X" ? (
            <g key={cell} className={className}>
              <line pathLength="1" x1={cx - 7} y1={cy - 7} x2={cx + 7} y2={cy + 7} />
              <line pathLength="1" x1={cx + 7} y1={cy - 7} x2={cx - 7} y2={cy + 7} />
            </g>
          ) : (
            <g key={cell} className={className}>
              <circle pathLength="1" cx={cx} cy={cy} r="8" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
