import type { ReactElement } from "react";
import { useId } from "react";

interface ReliquaryArtProps {
  /** When true the T-piece falls and locks on a loop; otherwise a still frame is shown. */
  live: boolean;
}

const COLS = 10;
const ROWS = 14;
const CELL = 10;
const INSET = 0.6;
const SIZE = CELL - INSET * 2;

/** Mirrors the tetromino palette in TetrisEngine so the art matches the game. */
const PALETTE: Record<string, string> = {
  I: "#b9b3a4",
  J: "#7c6a5a",
  L: "#4f6b73",
  O: "#a8926a",
  S: "#6b7f6a",
  T: "#8a7550",
  Z: "#5c4a3f",
};

/** Settled layers, bottom five rows plus the crest. No row is complete: nothing is cleared. */
const STACK: { row: number; cells: string }[] = [
  { row: 9, cells: "J...SS...." },
  { row: 10, cells: "JJL.SSZ.O." },
  { row: 11, cells: "JLLTSZZTO." },
  { row: 12, cells: "ILLTSZOTO." },
  { row: 13, cells: "JJL.SZOTLI" },
];

/** A T-piece pointing down: bar on row 0, stem on row 1, falling into the dip at column 7. */
const PIECE: [number, number][] = [
  [0, 6],
  [0, 7],
  [0, 8],
  [1, 7],
];
const LANDING_ROW = 9;

function cellProps(row: number, col: number): { x: number; y: number; width: number; height: number; rx: number } {
  return { x: col * CELL + INSET, y: row * CELL + INSET, width: SIZE, height: SIZE, rx: 1 };
}

export function ReliquaryArt({ live }: ReliquaryArtProps): ReactElement {
  const glowId = `rq-glow-${useId().replace(/:/g, "")}`;
  const emptyCells: ReactElement[] = [];

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      emptyCells.push(<rect key={`${row}-${col}`} {...cellProps(row, col)} className="rq-empty" />);
    }
  }

  return (
    <svg
      className={`art art-reliquary${live ? " is-live" : ""}`}
      viewBox="0 0 100 140"
      preserveAspectRatio="xMidYMax slice"
      focusable="false"
    >
      <defs>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g>{emptyCells}</g>

      {/* Sediment: deeper layers sit dimmer, like strata. */}
      <g filter={`url(#${glowId})`}>
        {STACK.flatMap(({ row, cells }) =>
          [...cells].map((letter, col) =>
            letter === "." ? null : (
              <rect
                key={`s-${row}-${col}`}
                {...cellProps(row, col)}
                fill={PALETTE[letter]}
                opacity={0.9 - 0.1 * (row - 9)}
              />
            ),
          ),
        )}
      </g>

      {/* Where the piece will land. */}
      <g className="rq-ghost">
        {PIECE.map(([row, col]) => (
          <rect key={`g-${row}-${col}`} {...cellProps(row + LANDING_ROW, col)} />
        ))}
      </g>

      <g className="rq-piece" filter={`url(#${glowId})`}>
        {PIECE.map(([row, col]) => (
          <rect key={`p-${row}-${col}`} {...cellProps(row, col)} fill={PALETTE.T} />
        ))}
      </g>

      <g className="rq-flash">
        {PIECE.map(([row, col]) => (
          <rect key={`f-${row}-${col}`} {...cellProps(row + LANDING_ROW, col)} />
        ))}
      </g>

      <path className="rq-wall" d="M0.3 0V139.7H99.7V0" fill="none" />
    </svg>
  );
}
