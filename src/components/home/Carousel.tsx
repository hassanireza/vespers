import type { KeyboardEvent, PointerEvent, ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GAMES } from "../../data/games";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { GameCard } from "./GameCard";
import "./Carousel.css";

const AUTOPLAY_MS = 7000;
const DRAG_THRESHOLD_PX = 6;
/** A drag past this fraction of a slide's width advances to the next slide. */
const DRAG_ADVANCE_RATIO = 0.12;
const SCROLL_SETTLE_PX = 2;
const SCROLL_LOCK_MS = 1000;
const COUNT = GAMES.length;

interface ScrollLock {
  left: number;
  timer: number;
}

interface DragState {
  pending: boolean;
  dragging: boolean;
  startX: number;
  startScroll: number;
  startIndex: number;
}

export function Carousel(): ReactElement {
  const reducedMotion = useReducedMotion();

  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  const regionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollLock = useRef<ScrollLock | null>(null);
  const frame = useRef(0);
  const drag = useRef<DragState>({
    pending: false,
    dragging: false,
    startX: 0,
    startScroll: 0,
    startIndex: 0,
  });

  // Autoplay is a courtesy: it never runs with reduced motion, off screen,
  // while the pointer or focus is inside, or once the person takes over.
  const playing = autoplay && !reducedMotion;
  const running = playing && inView && !tabHidden && !hovered && !focused && !dragging;

  const slideLeft = useCallback((index: number): number | null => {
    const track = trackRef.current;
    const slide = slideRefs.current[index];
    if (!track || !slide) return null;
    return slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
  }, []);

  const releaseLock = useCallback(() => {
    if (scrollLock.current) {
      window.clearTimeout(scrollLock.current.timer);
      scrollLock.current = null;
    }
  }, []);

  const goTo = useCallback(
    (target: number, behavior: ScrollBehavior = "smooth") => {
      const index = ((target % COUNT) + COUNT) % COUNT;
      const left = slideLeft(index);
      const track = trackRef.current;
      if (left === null || !track) return;

      releaseLock();
      setCurrent(index);

      if (behavior === "smooth" && !reducedMotion) {
        // Ignore the in-between scroll positions so the active slide only changes once.
        scrollLock.current = {
          left,
          timer: window.setTimeout(() => {
            scrollLock.current = null;
          }, SCROLL_LOCK_MS),
        };
        track.scrollTo({ left, behavior: "smooth" });
      } else {
        track.scrollTo({ left, behavior: "auto" });
      }
    },
    [slideLeft, reducedMotion, releaseLock],
  );

  const takeOver = useCallback(() => setAutoplay(false), []);

  const step = useCallback(
    (delta: number) => {
      takeOver();
      goTo(current + delta);
    },
    [current, goTo, takeOver],
  );

  // Keep `current` in sync with native scrolling (touch swipes, trackpads, keyboard scroll).
  const handleScroll = useCallback(() => {
    if (frame.current) return;

    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0;
      const track = trackRef.current;
      if (!track) return;

      if (scrollLock.current) {
        if (Math.abs(track.scrollLeft - scrollLock.current.left) > SCROLL_SETTLE_PX) return;
        releaseLock();
      }

      const center = track.scrollLeft + track.clientWidth / 2;
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      slideRefs.current.forEach((slide, index) => {
        if (!slide) return;
        const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center);
        if (distance < nearestDistance) {
          nearest = index;
          nearestDistance = distance;
        }
      });

      setCurrent(nearest);
    });
  }, [releaseLock]);

  // Mouse drag-to-scroll. Touch and pen use native scrolling and scroll-snap.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    takeOver();
    releaseLock();
    if (event.pointerType !== "mouse" || event.button !== 0 || !trackRef.current) return;

    drag.current = {
      pending: true,
      dragging: false,
      startX: event.clientX,
      startScroll: trackRef.current.scrollLeft,
      startIndex: current,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const track = trackRef.current;
    if (!state.pending || !track) return;

    const delta = event.clientX - state.startX;

    if (!state.dragging && Math.abs(delta) > DRAG_THRESHOLD_PX) {
      state.dragging = true;
      setDragging(true);
      track.setPointerCapture(event.pointerId);
    }

    if (state.dragging) track.scrollLeft = state.startScroll - delta;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const track = trackRef.current;
    if (!state.pending || !track) return;

    const wasDragging = state.dragging;
    drag.current = { ...state, pending: false };

    if (wasDragging) {
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      setDragging(false);

      // A short, deliberate drag turns the page; a tiny one springs back.
      const travelled = track.scrollLeft - state.startScroll;
      const slideWidth = slideRefs.current[0]?.offsetWidth ?? track.clientWidth;
      const direction = Math.abs(travelled) > slideWidth * DRAG_ADVANCE_RATIO ? Math.sign(travelled) : 0;
      goTo(Math.min(Math.max(state.startIndex + direction, 0), COUNT - 1));

      // Keep swallowing the click that follows this mouse-up, then stop.
      window.setTimeout(() => {
        drag.current.dragging = false;
      }, 0);
    }
  };

  // A drag that ends over a link must not count as a click on it.
  const handleClickCapture = (event: React.MouseEvent) => {
    if (drag.current.dragging) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      takeOver();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      takeOver();
      goTo(COUNT - 1);
    }
  };

  // Only animate and advance while the carousel is actually visible.
  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(region);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Re-centre the active slide when the layout changes (rotation, resize, font load).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let lastWidth = track.clientWidth;
    const observer = new ResizeObserver(() => {
      if (track.clientWidth === lastWidth) return;
      lastWidth = track.clientWidth;
      const left = slideLeft(current);
      if (left !== null) track.scrollTo({ left, behavior: "auto" });
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, [current, slideLeft]);

  useEffect(
    () => () => {
      releaseLock();
      if (frame.current) window.cancelAnimationFrame(frame.current);
    },
    [releaseLock],
  );

  return (
    <section
      ref={regionRef}
      className="carousel"
      aria-roledescription="carousel"
      aria-label="The Rites"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div
        ref={trackRef}
        className={`carousel-track${dragging ? " is-dragging" : ""}`}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={takeOver}
        onClickCapture={handleClickCapture}
      >
        {GAMES.map((game, index) => {
          const active = index === current;

          return (
            <div
              key={game.id}
              ref={(node) => {
                slideRefs.current[index] = node;
              }}
              className="carousel-slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${COUNT}: ${game.title}`}
            >
              {/* `inert` keeps off-centre slides out of the tab order and the accessibility tree. */}
              <div className="carousel-slide-content" inert={!active}>
                <GameCard game={game} active={active} live={active && inView && !tabHidden && !reducedMotion} />
              </div>

              {!active && (
                <button
                  type="button"
                  className="carousel-peek"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => {
                    takeOver();
                    goTo(index);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="carousel-controls">
        <div className="carousel-arrows">
          <button className="carousel-button" onClick={() => step(-1)} aria-label="Previous rite" type="button">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="carousel-button" onClick={() => step(1)} aria-label="Next rite" type="button">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <ul className="carousel-rail" aria-label="Choose a rite">
          {GAMES.map((game, index) => {
            const active = index === current;
            const timed = active && playing;

            return (
              <li key={game.id}>
                <button
                  type="button"
                  className={`rail-item${active ? " is-active" : ""}`}
                  aria-label={`Show ${game.title}`}
                  aria-current={active ? "true" : undefined}
                  onClick={() => {
                    takeOver();
                    goTo(index);
                  }}
                >
                  <span className="rail-track" aria-hidden="true">
                    {timed ? (
                      <span
                        key={current}
                        className="rail-fill is-timed"
                        data-running={running}
                        style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                        onAnimationEnd={() => goTo(current + 1)}
                      />
                    ) : (
                      <span className={`rail-fill${active ? " is-full" : ""}`} />
                    )}
                  </span>
                  <span className="rail-label" aria-hidden="true">
                    <span className="rail-numeral">{game.numeral}</span>
                    <span className="rail-title">{game.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {!reducedMotion && (
          <button
            className="carousel-button"
            onClick={() => setAutoplay((value) => !value)}
            aria-label={playing ? "Pause automatic rotation" : "Start automatic rotation"}
            type="button"
          >
            {playing ? (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="7" y="5" width="3.2" height="14" rx="0.6" />
                <rect x="13.8" y="5" width="3.2" height="14" rx="0.6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13l10.5-6.5z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
