import type { ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GAMES } from "../../data/games";
import { LifeEngine, type LifeState } from "../../engine/LifeEngine";
import "./Hero.css";

const DEMO_ROWS = 16;
const DEMO_COLS = 12;
const DEMO_SPEED_MS = 260;

export function Hero(): ReactElement {
  const navigate = useNavigate();
  const engineRef = useRef<LifeEngine | null>(null);
  const [demoState, setDemoState] = useState<LifeState | null>(null);

  const handleSurpriseMe = useCallback(() => {
    const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
    navigate(randomGame.route);
  }, [navigate]);

  useEffect(() => {
    const engine = new LifeEngine(DEMO_ROWS, DEMO_COLS);
    engineRef.current = engine;
    engine.setSpeed(DEMO_SPEED_MS);

    const unsubscribe = engine.subscribe(setDemoState);
    engine.start();
    engine.play();

    const reseed = window.setInterval(() => {
      if (engine.getState().population < 6) {
        engine.randomize(0.32);
        engine.play();
      }
    }, 4000);

    return () => {
      window.clearInterval(reseed);
      unsubscribe();
      engine.destroy();
    };
  }, []);

  return (
    <header className="hero">
      <div className="hero-content container">
        <div className="hero-text">
          <span className="tag">Three Rites, Rendered in Bone and Shadow</span>

          <h1>
            Nothing arrives
            <br />
            unchanged.
          </h1>

          <p>
            Vespers is a small collection of quiet games, stripped of ornament and
            lit like conservation photography. No accounts, no downloads, no
            ceremony beyond the one already on the screen. Choose a rite below.
          </p>

          <div className="hero-buttons">
            <a href="#games" className="primary-btn">
              Begin
            </a>

            <button className="glass-btn" onClick={handleSurpriseMe} type="button">
              Choose for Me
            </button>
          </div>
        </div>

        <div className="hero-frame" aria-hidden="true">
          <div className="hero-frame-inner">
            <div className="hero-screen">
              <div className="hero-screen-bar">
                <span className="hero-screen-dot" />
                <span className="hero-screen-dot" />
                <span className="hero-screen-dot" />
                <span className="hero-screen-label">abyssal-bloom.demo</span>
              </div>

              <div
                className="hero-screen-grid"
                style={{ gridTemplateColumns: `repeat(${DEMO_COLS}, 1fr)` }}
              >
                {demoState?.grid.flat().map((cell, index) => (
                  <span key={index} className={`hero-cell${cell ? " alive" : ""}`} />
                ))}
              </div>

              <div className="hero-screen-caption">
                <span>Abyssal Bloom</span>
                <span>Rite III: Shedding</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
