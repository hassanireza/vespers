import { GameEngine } from "./GameEngine";

export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = Cell[];

export type Difficulty = "easy" | "normal" | "impossible";

export interface TicTacToeState {
  board: Board;
  human: Player;
  ai: Player;
  turn: Player;
  winner: Player | "draw" | null;
  winningLine: number[] | null;
  difficulty: Difficulty;
  wins: number;
  losses: number;
  draws: number;
}

const WIN_COMBOS: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

interface MinimaxResult {
  index: number;
  score: number;
}

/**
 * TicTacToeEngine
 *
 * Ports the original minimax based AI to a typed class and adds a
 * difficulty setting. "Impossible" plays perfect minimax (as the
 * original always did), "Normal" occasionally settles for a good but
 * not optimal move, and "Easy" mostly plays randomly so newer players
 * can actually win. Session scoreboard tracking is a new addition.
 */
export class TicTacToeEngine extends GameEngine<TicTacToeState> {
  private board: Board = Array(9).fill(null);
  private readonly human: Player = "O";
  private readonly ai: Player = "X";
  private turn: Player = "O";
  private winner: Player | "draw" | null = null;
  private winningLine: number[] | null = null;
  private difficulty: Difficulty = "impossible";
  private wins = 0;
  private losses = 0;
  private draws = 0;

  public getState(): TicTacToeState {
    return {
      board: [...this.board],
      human: this.human,
      ai: this.ai,
      turn: this.turn,
      winner: this.winner,
      winningLine: this.winningLine ? [...this.winningLine] : null,
      difficulty: this.difficulty,
      wins: this.wins,
      losses: this.losses,
      draws: this.draws,
    };
  }

  public start(): void {
    this.running = true;
    this.emit();
  }

  public reset(): void {
    this.board = Array(9).fill(null);
    this.winner = null;
    this.winningLine = null;
    this.turn = this.human;
    this.running = true;
    this.emit();
  }

  public setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
    this.emit();
  }

  private checkWinner(board: Board, player: Player): number[] | null {
    for (const combo of WIN_COMBOS) {
      if (combo.every((index) => board[index] === player)) {
        return combo;
      }
    }
    return null;
  }

  private emptyIndices(board: Board): number[] {
    return board.reduce<number[]>((acc, cell, index) => {
      if (cell === null) acc.push(index);
      return acc;
    }, []);
  }

  public playHumanMove(index: number): void {
    if (this.winner || this.board[index] !== null || this.turn !== this.human) {
      return;
    }

    this.applyMove(index, this.human);

    if (this.winner) {
      this.emit();
      return;
    }

    this.turn = this.ai;
    this.emit();

    window.setTimeout(() => this.playAiMove(), 380);
  }

  private applyMove(index: number, player: Player): void {
    this.board[index] = player;

    const line = this.checkWinner(this.board, player);
    if (line) {
      this.winner = player;
      this.winningLine = line;
      this.running = false;
      if (player === this.human) this.wins += 1;
      if (player === this.ai) this.losses += 1;
      return;
    }

    if (this.emptyIndices(this.board).length === 0) {
      this.winner = "draw";
      this.running = false;
      this.draws += 1;
    }
  }

  private playAiMove(): void {
    if (this.winner) return;

    const index = this.pickAiMove();
    this.applyMove(index, this.ai);

    if (!this.winner) {
      this.turn = this.human;
    }

    this.emit();
  }

  private pickAiMove(): number {
    const empty = this.emptyIndices(this.board);

    if (this.difficulty === "easy") {
      // Mostly random, but still blocks an immediate loss occasionally.
      if (Math.random() < 0.75) {
        return empty[Math.floor(Math.random() * empty.length)];
      }
      return this.minimax([...this.board], this.ai).index;
    }

    if (this.difficulty === "normal") {
      if (Math.random() < 0.25) {
        return empty[Math.floor(Math.random() * empty.length)];
      }
      return this.minimax([...this.board], this.ai).index;
    }

    return this.minimax([...this.board], this.ai).index;
  }

  private minimax(board: Board, player: Player): MinimaxResult {
    const availSpots = this.emptyIndices(board);

    if (this.checkWinner(board, this.human)) return { index: -1, score: -10 };
    if (this.checkWinner(board, this.ai)) return { index: -1, score: 10 };
    if (availSpots.length === 0) return { index: -1, score: 0 };

    const moves: MinimaxResult[] = [];

    for (const spot of availSpots) {
      const move: Partial<MinimaxResult> = { index: spot };
      board[spot] = player;

      const result =
        player === this.ai
          ? this.minimax(board, this.human)
          : this.minimax(board, this.ai);

      move.score = result.score;
      board[spot] = null;
      moves.push(move as MinimaxResult);
    }

    let bestMove = 0;

    if (player === this.ai) {
      let bestScore = -Infinity;
      moves.forEach((move, i) => {
        if (move.score > bestScore) {
          bestScore = move.score;
          bestMove = i;
        }
      });
    } else {
      let bestScore = Infinity;
      moves.forEach((move, i) => {
        if (move.score < bestScore) {
          bestScore = move.score;
          bestMove = i;
        }
      });
    }

    return moves[bestMove];
  }
}
