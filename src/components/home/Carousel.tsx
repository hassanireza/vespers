import type { ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GAMES } from "../../data/games";
import { GameCard } from "./GameCard";
import "./Carousel.css";

const AUTOPLAY_INTERVAL_MS = 6000;
const SWIPE_THRESHOLD_PX = 50;

export function Carousel(): ReactElement {
  const [current, setCurrent] = useState(0);
  const autoplayRef = useRef<number | null>(null);
  const touchStartX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    setCurrent(((index % GAMES.length) + GAMES.length) % GAMES.length);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayRef.current = window.setInterval(() => {
      setCurrent((value) => (value + 1) % GAMES.length);
    }, AUTOPLAY_INTERVAL_MS);
  }, []);

  const stopAutoplay = () => {
    if (autoplayRef.current !== null) {
      window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const deltaX = touchStartX.current - event.changedTouches[0].clientX;
    if (deltaX > SWIPE_THRESHOLD_PX) next();
    if (deltaX < -SWIPE_THRESHOLD_PX) prev();
  };

  return (
    <section className="carousel-wrapper" onMouseEnter={stopAutoplay} onMouseLeave={startAutoplay}>
      <button className="nav-arrow left" onClick={prev} aria-label="Previous game" type="button">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div
        className="carousel-track"
        ref={trackRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {GAMES.map((game, index) => {
          const offset = index - current;
          const isActive = index === current;

          return (
            <div
              key={game.id}
              className="carousel-slot"
              style={{
                transform: `translate(-50%, -50%) translateX(${offset * 95}%) scale(${isActive ? 1 : 0.85})`,
                opacity: isActive ? 1 : 0.35,
                zIndex: GAMES.length - Math.abs(offset),
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <GameCard game={game} active={isActive} />
            </div>
          );
        })}
      </div>

      <button className="nav-arrow right" onClick={next} aria-label="Next game" type="button">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="carousel-dots" role="tablist" aria-label="Select game">
        {GAMES.map((game, index) => (
          <button
            key={game.id}
            role="tab"
            aria-selected={index === current}
            aria-label={`Show ${game.title}`}
            className={`dot${index === current ? " dot-active" : ""}`}
            onClick={() => goTo(index)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}
