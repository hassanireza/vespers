import { GameEngine } from "./GameEngine";
import { SoundManager } from "./SoundManager";

export const TETRIS_ROWS = 20;
export const TETRIS_COLS = 10;

export type Board = number[][];
export type Shape = number[][];

export interface TetrominoDefinition {
  shape: Shape;
  color: string;
}

export interface ActivePiece {
  shape: Shape;
  color: string;
  x: number;
  y: number;
  typeIndex: number;
}

export interface TetrisState {
  board: Board;
  current: ActivePiece;
  next: ActivePiece;
  hold: ActivePiece | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
}

const PIECES: TetrominoDefinition[] = [
  { shape: [[1, 1, 1, 1]], color: "#b9b3a4" },
  {
    shape: [
      [2, 0, 0],
      [2, 2, 2],
    ],
    color: "#7c6a5a",
  },
  {
    shape: [
      [0, 0, 3],
      [3, 3, 3],
    ],
    color: "#4f6b73",
  },
  {
    shape: [
      [4, 4],
      [4, 4],
    ],
    color: "#a8926a",
  },
  {
    shape: [
      [0, 5, 5],
      [5, 5, 0],
    ],
    color: "#6b7f6a",
  },
  {
    shape: [
      [0, 6, 0],
      [6, 6, 6],
    ],
    color: "#8a7550",
  },
  {
    shape: [
      [7, 7, 0],
      [0, 7, 7],
    ],
    color: "#5c4a3f",
  },
];

const LINES_PER_LEVEL = 10;
const BASE_DROP_MS = 750;
const MIN_DROP_MS = 120;

function createEmptyBoard(): Board {
  return Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(0));
}

function rotateShape(shape: Shape): Shape {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: Shape = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }

  return rotated;
}

export class TetrisEngine extends GameEngine<TetrisState> {
  private board: Board = createEmptyBoard();
  private current: ActivePiece;
  private next: ActivePiece;
  private hold: ActivePiece | null = null;
  private canHold = true;
  private score = 0;
  private lines = 0;
  private level = 1;
  private gameOver = false;
  private paused = false;
  private dropTimer: number | null = null;
  private lastDrop = 0;
  private readonly sound: SoundManager;

  constructor(sound: SoundManager) {
    super();
    this.sound = sound;
    this.current = this.spawnPiece();
    this.next = this.spawnPiece();
  }

  private spawnPiece(): ActivePiece {
    const typeIndex = Math.floor(Math.random() * PIECES.length);
    const definition = PIECES[typeIndex];

    return {
      shape: definition.shape.map((row) => [...row]),
      color: definition.color,
      x: Math.floor(TETRIS_COLS / 2) - Math.ceil(definition.shape[0].length / 2),
      y: 0,
      typeIndex,
    };
  }

  public getState(): TetrisState {
    return {
      board: this.board.map((row) => [...row]),
      current: { ...this.current, shape: this.current.shape.map((r) => [...r]) },
      next: { ...this.next, shape: this.next.shape.map((r) => [...r]) },
      hold: this.hold
        ? { ...this.hold, shape: this.hold.shape.map((r) => [...r]) }
        : null,
      canHold: this.canHold,
      score: this.score,
      lines: this.lines,
      level: this.level,
      gameOver: this.gameOver,
      paused: this.paused,
    };
  }

  private collides(xOffset: number, yOffset: number, shape: Shape): boolean {
    for (let r = 0; r < shape.length; r += 1) {
      for (let c = 0; c < shape[r].length; c += 1) {
        if (!shape[r][c]) continue;

        const newX = this.current.x + c + xOffset;
        const newY = this.current.y + r + yOffset;

        if (
          newX < 0 ||
          newX >= TETRIS_COLS ||
          newY >= TETRIS_ROWS ||
          (newY >= 0 && this.board[newY][newX])
        ) {
          return true;
        }
      }
    }
    return false;
  }

  private merge(): void {
    this.current.shape.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value) {
          this.board[this.current.y + r][this.current.x + c] = value;
        }
      });
    });
  }

  private clearLines(): void {
    let cleared = 0;

    for (let r = TETRIS_ROWS - 1; r >= 0; r -= 1) {
      if (this.board[r].every((cell) => cell !== 0)) {
        this.board.splice(r, 1);
        this.board.unshift(Array(TETRIS_COLS).fill(0));
        cleared += 1;
        r += 1;
      }
    }

    if (cleared > 0) {
      const points = [0, 100, 300, 500, 800][cleared] ?? cleared * 200;
      this.score += points * this.level;
      this.lines += cleared;
      this.level = Math.floor(this.lines / LINES_PER_LEVEL) + 1;
      this.sound.beep(220, 0.15);
    }
  }

  private dropIntervalMs(): number {
    return Math.max(MIN_DROP_MS, BASE_DROP_MS - (this.level - 1) * 60);
  }

  private lockPiece(): void {
    this.merge();
    this.sound.beep(320, 0.04);
    this.clearLines();
    this.current = this.next;
    this.next = this.spawnPiece();
    this.canHold = true;

    if (this.collides(0, 0, this.current.shape)) {
      this.gameOver = true;
      this.running = false;
      this.sound.beep(120, 0.4);
    }
  }

  private tick = (): void => {
    if (!this.running) return;

    const now = performance.now();
    if (now - this.lastDrop > this.dropIntervalMs()) {
      if (!this.collides(0, 1, this.current.shape)) {
        this.current.y += 1;
      } else {
        this.lockPiece();
      }
      this.lastDrop = now;
      this.emit();
    }

    this.dropTimer = requestAnimationFrame(this.tick);
  };

  public start(): void {
    if (this.gameOver) {
      this.reset();
    }
    this.running = true;
    this.paused = false;
    this.lastDrop = performance.now();
    if (this.dropTimer === null) {
      this.dropTimer = requestAnimationFrame(this.tick);
    }
    this.emit();
  }

  public togglePause(): void {
    if (this.gameOver) return;
    this.paused = !this.paused;
    this.running = !this.paused;
    if (this.running) {
      this.lastDrop = performance.now();
    }
    this.emit();
  }

  public stop(): void {
    super.stop();
    if (this.dropTimer !== null) {
      cancelAnimationFrame(this.dropTimer);
      this.dropTimer = null;
    }
  }

  public reset(): void {
    this.stop();
    this.board = createEmptyBoard();
    this.current = this.spawnPiece();
    this.next = this.spawnPiece();
    this.hold = null;
    this.canHold = true;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;
    this.emit();
  }

  public move(direction: -1 | 1): void {
    if (!this.running || this.paused) return;
    if (!this.collides(direction, 0, this.current.shape)) {
      this.current.x += direction;
      this.emit();
    }
  }

  public softDrop(): void {
    if (!this.running || this.paused) return;
    if (!this.collides(0, 1, this.current.shape)) {
      this.current.y += 1;
      this.score += 1;
    } else {
      this.lockPiece();
    }
    this.lastDrop = performance.now();
    this.emit();
  }

  public hardDrop(): void {
    if (!this.running || this.paused) return;
    let distance = 0;
    while (!this.collides(0, 1, this.current.shape)) {
      this.current.y += 1;
      distance += 1;
    }
    this.score += distance * 2;
    this.lockPiece();
    this.lastDrop = performance.now();
    this.emit();
  }

  public rotate(): void {
    if (!this.running || this.paused) return;
    const rotated = rotateShape(this.current.shape);
    if (!this.collides(0, 0, rotated)) {
      this.current.shape = rotated;
      this.sound.beep(600, 0.05);
      this.emit();
    }
  }

  public holdPiece(): void {
    if (!this.running || this.paused || !this.canHold) return;

    if (this.hold === null) {
      this.hold = { ...this.current, x: 0, y: 0 };
      this.current = this.next;
      this.next = this.spawnPiece();
    } else {
      const swapped = this.hold;
      this.hold = { ...this.current, x: 0, y: 0 };
      this.current = {
        ...swapped,
        x: Math.floor(TETRIS_COLS / 2) - Math.ceil(swapped.shape[0].length / 2),
        y: 0,
      };
    }

    this.canHold = false;
    this.sound.beep(480, 0.06);
    this.emit();
  }
}
