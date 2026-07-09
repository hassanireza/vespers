import type { ReactElement } from "react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GAMES } from "../../data/games";
import "./Hero.css";

export function Hero(): ReactElement {
  const navigate = useNavigate();

  const handleSurpriseMe = useCallback(() => {
    const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
    navigate(randomGame.route);
  }, [navigate]);

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
            <svg className="hero-figure" viewBox="0 0 200 260" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="figureFade" cx="50%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#e9e4d8" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#e9e4d8" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="100" cy="70" rx="90" ry="90" fill="url(#figureFade)" />
              <path
                d="M100 40c14 0 24 12 24 27 0 13-7 23-16 27 22 6 38 22 42 46 2 12 2 26 2 40H48c0-14 0-28 2-40 4-24 20-40 42-46-9-4-16-14-16-27 0-15 10-27 24-27z"
                fill="none"
                stroke="#e9e4d8"
                strokeWidth="0.6"
                opacity="0.35"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
