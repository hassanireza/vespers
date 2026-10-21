import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import type { GameMeta } from "../../data/games";
import { BloomArt } from "./art/BloomArt";
import { CovenantArt } from "./art/CovenantArt";
import { ReliquaryArt } from "./art/ReliquaryArt";
import { SpecimenFrame } from "./art/SpecimenFrame";
import "./GameCard.css";

interface GameCardProps {
  game: GameMeta;
  /** This slide is the one centred in the carousel. */
  active: boolean;
  /** The artwork should animate (slide is active, on screen, and motion is allowed). */
  live: boolean;
}

function artFor(id: string, live: boolean): ReactElement {
  switch (id) {
    case "neon-blocks":
      return <ReliquaryArt live={live} />;
    case "tic-tac-toe":
      return <CovenantArt live={live} />;
    default:
      return <BloomArt live={live} />;
  }
}

export function GameCard({ game, active, live }: GameCardProps): ReactElement {
  return (
    <article className={`rite${active ? " is-active" : ""}`} data-glow={game.glow}>
      <div className="rite-art">
        <SpecimenFrame
          label={`${game.slug}.demo`}
          captionLeft={game.title}
          captionRight={game.category}
        >
          {artFor(game.id, live)}
        </SpecimenFrame>
      </div>

      <div className="rite-copy">
        <span className="rite-category">{game.category}</span>
        <h3>{game.title}</h3>
        <p className="rite-description">{game.description}</p>

        <dl className="rite-facts">
          {game.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>

        <Link to={game.route} className="play-btn" aria-label={`Enter ${game.title}`}>
          Enter
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
