import type { ReactElement } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GamePageHeader } from "../components/games/GamePageHeader";
import { SoundManager } from "../engine/SoundManager";
import {
  TetrisEngine,
  TETRIS_COLS,
  TETRIS_ROWS,
  type TetrisState,
  type ActivePiece,
} from "../engine/TetrisEngine";
import "./NeonBlocksPage.css";

const BLOCK_SIZE = 28;

function drawPiece(
  ctx: CanvasRenderingContext2D,
  piece: ActivePiece,
  blockSize: number,
  offsetX = 0,
  offsetY = 0,
): void {
  piece.shape.forEach((row, r) => {
    row.forEach((value, c) => {
      if (!value) return;
      const px = (piece.x + c + offsetX) * blockSize;
      const py = (piece.y + r + offsetY) * blockSize;
      paintBlock(ctx, px, py, blockSize, piece.color);
    });
  });
}

function paintBlock(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  size: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(px, py, size, size);

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(px, py, size, 3);
  ctx.fillRect(px, py, 3, size);

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(px, py + size - 3, size, 3);
  ctx.fillRect(px + size - 3, py, 3, size);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.strokeRect(px, py, size, size);
}

const PALETTE = [
  "",
  "#b9b3a4",
  "#7c6a5a",
  "#4f6b73",
  "#a8926a",
  "#6b7f6a",
  "#8a7550",
  "#5c4a3f",
];

export function NeonBlocksPage(): ReactElement {
  const sound = useMemo(() => new SoundManager(), []);
  const engine = useMemo(() => new TetrisEngine(sound), [sound]);
  const [state, setState] = useState<TetrisState>(engine.getState());
  const [soundOn, setSoundOn] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const holdRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const unsubscribe = engine.subscribe(setState);
    engine.start();
    return () => {
      unsubscribe();
      engine.destroy();
      sound.dispose();
    };
    
  }, [engine]);

  useEffect(() => {
    sound.setEnabled(soundOn);
  }, [soundOn, sound]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
      }
      switch (event.key) {
        case "ArrowLeft":
          engine.move(-1);
          break;
        case "ArrowRight":
          engine.move(1);
          break;
        case "ArrowDown":
          engine.softDrop();
          break;
        case "ArrowUp":
          engine.rotate();
          break;
        case " ":
          engine.hardDrop();
          break;
        case "c":
        case "C":
          engine.holdPiece();
          break;
        case "p":
        case "P":
          engine.togglePause();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [engine]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    state.board.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value) {
          paintBlock(ctx, c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, PALETTE[value]);
        }
      });
    });

    drawPiece(ctx, state.current, BLOCK_SIZE);

    if (state.gameOver) {
      ctx.fillStyle = "rgba(4,8,18,0.88)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "700 22px 'Space Grotesk', sans-serif";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = "600 13px 'Inter', sans-serif";
      ctx.fillStyle = "#5DF2FF";
      ctx.fillText("PRESS RESTART", canvas.width / 2, canvas.height / 2 + 24);
    } else if (state.paused) {
      ctx.fillStyle = "rgba(4,8,18,0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "700 20px 'Space Grotesk', sans-serif";
      ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    }
  }, [state]);

  useEffect(() => {
    const previewCanvas = previewRef.current;
    if (previewCanvas) {
      const ctx = previewCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        const mini = { ...state.next, x: 0, y: 0 };
        drawPiece(ctx, mini, 20);
      }
    }

    const holdCanvas = holdRef.current;
    if (holdCanvas) {
      const ctx = holdCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
        if (state.hold) {
          const mini = { ...state.hold, x: 0, y: 0 };
          drawPiece(ctx, mini, 20);
        }
      }
    }
  }, [state.next, state.hold]);

  return (
    <>
      <GamePageHeader title="Reliquary" category="Rite I: Accumulation" />

      <section className="neon-blocks-layout container">
        <div className="neon-blocks-stage">
          <canvas
            ref={canvasRef}
            width={TETRIS_COLS * BLOCK_SIZE}
            height={TETRIS_ROWS * BLOCK_SIZE}
            className="tetris-canvas"
            role="img"
            aria-label="Reliquary game board"
          />

          <div className="mobile-controls" aria-hidden="true">
            <button type="button" onClick={() => engine.move(-1)} aria-label="Move left">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" /></svg>
            </button>
            <button type="button" onClick={() => engine.rotate()} aria-label="Rotate">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 1 1 2.7 6M4 12V6M4 12h6" /></svg>
            </button>
            <button type="button" onClick={() => engine.move(1)} aria-label="Move right">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" /></svg>
            </button>
            <button type="button" onClick={() => engine.softDrop()} aria-label="Soft drop">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M6 13l6 6 6-6" /></svg>
            </button>
            <button type="button" onClick={() => engine.hardDrop()} aria-label="Hard drop">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v11M7 10l5 5 5-5M5 20h14" /></svg>
            </button>
          </div>
        </div>

        <aside className="neon-blocks-panel">
          <div className="stat-card">
            <span>Score</span>
            <strong>{state.score}</strong>
          </div>

          <div className="stat-row">
            <div className="stat-card small">
              <span>Level</span>
              <strong>{state.level}</strong>
            </div>
            <div className="stat-card small">
              <span>Lines</span>
              <strong>{state.lines}</strong>
            </div>
          </div>

          <div className="preview-row">
            <div className="preview-box">
              <span>Next</span>
              <canvas ref={previewRef} width={80} height={60} />
            </div>
            <div className="preview-box">
              <span>Hold (C)</span>
              <canvas ref={holdRef} width={80} height={60} />
            </div>
          </div>

          <div className="panel-buttons">
            <button type="button" className="primary-btn" onClick={() => engine.reset()}>
              Restart
            </button>
            <button type="button" className="glass-btn" onClick={() => engine.togglePause()}>
              {state.paused ? "Resume" : "Pause"}
            </button>
            <button
              type="button"
              className="glass-btn"
              onClick={() => setSoundOn((value) => !value)}
              aria-pressed={soundOn}
            >
              Sound {soundOn ? "On" : "Off"}
            </button>
          </div>

          <div className="keybind-help">
            <h4>Controls</h4>
            <ul>
              <li><kbd>←</kbd> <kbd>→</kbd> Move</li>
              <li><kbd>↑</kbd> Rotate</li>
              <li><kbd>↓</kbd> Soft drop</li>
              <li><kbd>Space</kbd> Hard drop</li>
              <li><kbd>C</kbd> Hold piece</li>
              <li><kbd>P</kbd> Pause</li>
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
