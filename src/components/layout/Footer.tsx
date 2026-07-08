import type { ReactElement } from "react";
import "./Footer.css";

export function Footer(): ReactElement {
  return (
    <footer className="footer container">
      <div>&copy; {new Date().getFullYear()} Vespers. All rights reserved.</div>
      <div className="footer-credit">
        Built with
        <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
          <path d="M12 21s-6.7-4.35-9.33-8.2C.87 10.1 1.5 6.6 4.6 5.2 7 4.1 9.4 5 12 8c2.6-3 5-3.9 7.4-2.8 3.1 1.4 3.73 4.9 1.93 7.6C18.7 16.65 12 21 12 21z" />
        </svg>
        using React, TypeScript and Vite
      </div>
    </footer>
  );
}
