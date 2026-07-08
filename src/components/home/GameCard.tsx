import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import type { GameMeta } from "../../data/games";
import "./GameCard.css";

interface GameCardProps {
  game: GameMeta;
  active: boolean;
}

export function GameCard({ game, active }: GameCardProps): ReactElement {
  return (
    <article className={`game-card${active ? " active" : ""}`} aria-hidden={!active}>
      <div className={`card-glow ${game.glow}`} aria-hidden="true" />

      <div className={`game-cover cover-${game.glow}`} aria-hidden="true">
        <div className="cover-grain" />
        <div className="cover-glyph">{glyphFor(game.id)}</div>
      </div>

      <div className="game-info">
        <span className="game-category">{game.category}</span>
        <h3>{game.title}</h3>
        <p>{game.description}</p>

        <Link to={game.route} className="play-btn">
          Enter
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

/** Sparse line-art motifs standing in for each rite, drawn in a single muted stroke. */
function glyphFor(id: string): ReactElement {
  if (id === "neon-blocks") {
    // Reliquary: a vessel built of settling, unequal layers.
    return (
      <svg viewBox="0 0 100 120" width="100" height="120" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.85">
          <path d="M32 18h36l-4 84a4 4 0 0 1-4 4H40a4 4 0 0 1-4-4z" />
          <line x1="26" y1="18" x2="74" y2="18" strokeLinecap="round" />
          <line x1="34" y1="40" x2="66" y2="40" opacity="0.5" />
          <line x1="32" y1="64" x2="68" y2="64" opacity="0.5" />
          <line x1="34" y1="88" x2="66" y2="88" opacity="0.5" />
        </g>
      </svg>
    );
  }

  if (id === "tic-tac-toe") {
    // Covenant: two marks bound by a shared, faded lattice.
    return (
      <svg viewBox="0 0 100 100" width="100" height="100" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="0.75" opacity="0.35">
          <line x1="34" y1="6" x2="34" y2="94" />
          <line x1="66" y1="6" x2="66" y2="94" />
          <line x1="6" y1="34" x2="94" y2="34" />
          <line x1="6" y1="66" x2="94" y2="66" />
        </g>
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.9">
          <line x1="44" y1="44" x2="56" y2="56" />
          <line x1="56" y1="44" x2="44" y2="56" />
        </g>
        <circle cx="76" cy="24" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.9" />
      </svg>
    );
  }

  // Abyssal Bloom: rings spreading outward from a single seed.
  return (
    <svg viewBox="0 0 100 100" width="110" height="110" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="0.9">
        <circle cx="50" cy="50" r="6" opacity="0.9" />
        <circle cx="50" cy="50" r="18" opacity="0.55" />
        <circle cx="50" cy="50" r="32" opacity="0.32" />
        <circle cx="50" cy="50" r="46" opacity="0.16" />
      </g>
    </svg>
  );
}
