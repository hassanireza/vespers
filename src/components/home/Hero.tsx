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
          <div className="hero-frame-inner" />
        </div>
      </div>
    </header>
  );
}
