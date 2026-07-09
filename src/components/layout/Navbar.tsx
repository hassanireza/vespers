import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export function Navbar(): ReactElement {
  return (
    <nav className="nav container">
      <Link to="/" className="logo">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="logo-icon" />
        <span>Vespers</span>
      </Link>

      <div className="nav-links">
        <Link to="/#games">The Rites</Link>
        <Link to="/#about">About</Link>
        <a
          className="nav-github"
          href="https://github.com/hassanireza/vespers"
          target="_blank"
          rel="noreferrer"
          aria-label="View source on GitHub"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.18.08 1.8 1.2 1.8 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.7 5.38-5.26 5.67.42.36.78 1.07.78 2.15v3.19c0 .32.21.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
          </svg>
        </a>
      </div>
    </nav>
  );
}
