import { GameEngine } from "./GameEngine";

export type LifeGrid = number[][];

export interface LifeState {
  grid: LifeGrid;
  rows: number;
  cols: number;
  playing: boolean;
  generation: number;
  population: number;
  speedMs: number;
}

export type LifePattern = "glider" | "pulsar" | "glider-gun";

const MIN_SPEED_MS = 40;
const MAX_SPEED_MS = 400;
const DEFAULT_SPEED_MS = 90;

function buildEmptyGrid(rows: number, cols: number): LifeGrid {
  return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

export class LifeEngine extends GameEngine<LifeState> {
  private grid: LifeGrid;
  private rows: number;
  private cols: number;
  private playing = false;
  private generation = 0;
  private speedMs = DEFAULT_SPEED_MS;
  private timer: number | null = null;

  constructor(rows: number, cols: number) {
    super();
    this.rows = rows;
    this.cols = cols;
    this.grid = buildEmptyGrid(rows, cols);
  }

  public getState(): LifeState {
    let population = 0;
    for (const row of this.grid) {
      for (const cell of row) population += cell;
    }

    return {
      grid: this.grid.map((row) => [...row]),
      rows: this.rows,
      cols: this.cols,
      playing: this.playing,
      generation: this.generation,
      population,
      speedMs: this.speedMs,
    };
  }

  public start(): void {
    this.randomize();
  }

  public reset(): void {
    this.stop();
    this.grid = buildEmptyGrid(this.rows, this.cols);
    this.generation = 0;
    this.playing = false;
    this.emit();
  }

  public toggleCell(row: number, col: number): void {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    this.grid[row][col] = this.grid[row][col] ? 0 : 1;
    this.emit();
  }

  public randomize(density = 0.45): void {
    this.grid = this.grid.map((row) => row.map(() => (Math.random() < density ? 1 : 0)));
    this.generation = 0;
    this.emit();
  }

  public clear(): void {
    this.stop();
    this.grid = buildEmptyGrid(this.rows, this.cols);
    this.generation = 0;
    this.playing = false;
    this.emit();
  }

  public setSpeed(speedMs: number): void {
    this.speedMs = Math.min(MAX_SPEED_MS, Math.max(MIN_SPEED_MS, speedMs));
    this.emit();
    if (this.playing) {
      this.restartLoop();
    }
  }

  public play(): void {
    this.playing = true;
    this.running = true;
    this.restartLoop();
    this.emit();
  }

  public pause(): void {
    this.playing = false;
    this.running = false;
    this.stop();
    this.emit();
  }

  public toggle(): void {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  public stop(): void {
    super.stop();
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private restartLoop(): void {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
    }
    const step = () => {
      this.computeNextGeneration();
      this.emit();
      if (this.playing) {
        this.timer = window.setTimeout(step, this.speedMs);
      }
    };
    this.timer = window.setTimeout(step, this.speedMs);
  }

  private countNeighbors(row: number, col: number): number {
    let count = 0;
    for (let i = -1; i <= 1; i += 1) {
      for (let j = -1; j <= 1; j += 1) {
        if (i === 0 && j === 0) continue;
        const r = row + i;
        const c = col + j;
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
          count += this.grid[r][c];
        }
      }
    }
    return count;
  }

  private computeNextGeneration(): void {
    const next = buildEmptyGrid(this.rows, this.cols);

    for (let r = 0; r < this.rows; r += 1) {
      for (let c = 0; c < this.cols; c += 1) {
        const neighbors = this.countNeighbors(r, c);
        const alive = this.grid[r][c] === 1;

        if (alive && (neighbors === 2 || neighbors === 3)) {
          next[r][c] = 1;
        } else if (!alive && neighbors === 3) {
          next[r][c] = 1;
        }
      }
    }

    this.grid = next;
    this.generation += 1;
  }

  public stampPattern(pattern: LifePattern): void {
    this.stop();
    this.playing = false;
    this.grid = buildEmptyGrid(this.rows, this.cols);
    this.generation = 0;

    const originRow = Math.floor(this.rows / 2) - 4;
    const originCol = Math.floor(this.cols / 2) - 4;

    const coordinates = PATTERNS[pattern];

    coordinates.forEach(([dr, dc]) => {
      const r = originRow + dr;
      const c = originCol + dc;
      if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
        this.grid[r][c] = 1;
      }
    });

    this.emit();
  }

  public resize(rows: number, cols: number): void {
    this.stop();
    this.rows = rows;
    this.cols = cols;
    this.grid = buildEmptyGrid(rows, cols);
    this.generation = 0;
    this.playing = false;
    this.emit();
  }
}

const PATTERNS: Record<LifePattern, Array<[number, number]>> = {
  glider: [
    [0, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  pulsar: [
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
  ],
  "glider-gun": [
    [0, 24],
    [1, 22], [1, 24],
    [2, 12], [2, 13], [2, 20], [2, 21], [2, 34], [2, 35],
    [3, 11], [3, 15], [3, 20], [3, 21], [3, 34], [3, 35],
    [4, 0], [4, 1], [4, 10], [4, 16], [4, 20], [4, 21],
    [5, 0], [5, 1], [5, 10], [5, 14], [5, 16], [5, 17], [5, 22], [5, 24],
    [6, 10], [6, 16], [6, 24],
    [7, 11], [7, 15],
    [8, 12], [8, 13],
  ],
};
