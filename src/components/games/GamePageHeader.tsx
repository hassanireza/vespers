import { Link } from "react-router-dom";
import type { ReactElement, ReactNode } from "react";
import "./GamePageHeader.css";

interface GamePageHeaderProps {
  title: string;
  category: string;
  children?: ReactNode;
}

export function GamePageHeader({ title, category, children }: GamePageHeaderProps): ReactElement {
  return (
    <header className="game-page-header container">
      <Link to="/" className="back-link">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Library
      </Link>

      <div className="game-page-title">
        <span className="game-page-category">{category.toUpperCase()}</span>
        <h1>{title}</h1>
      </div>

      {children}
    </header>
  );
}
