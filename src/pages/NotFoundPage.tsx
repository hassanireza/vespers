import type { ReactElement } from "react";
import { Link } from "react-router-dom";

export function NotFoundPage(): ReactElement {
  return (
    <section className="container" style={{ padding: "160px 6vw", textAlign: "center" }}>
      <h1 style={{ fontSize: "4rem", marginBottom: "20px" }}>404</h1>
      <p style={{ color: "var(--color-text-dim)", marginBottom: "30px" }}>
        This realm does not exist yet.
      </p>
      <Link to="/" className="primary-btn" style={{ textDecoration: "none" }}>
        Return Home
      </Link>
    </section>
  );
}
