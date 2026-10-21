import type { ReactElement, ReactNode } from "react";
import "./art.css";

interface SpecimenFrameProps {
  /** File-style label in the window bar, e.g. "reliquary.demo". */
  label: string;
  captionLeft: string;
  captionRight: string;
  children: ReactNode;
}

/**
 * The shared "specimen" chrome for every rite: the same double-ruled frame,
 * window bar, scanlines and caption row used by the home hero.
 * Purely decorative, so it is hidden from assistive technology.
 */
export function SpecimenFrame({
  label,
  captionLeft,
  captionRight,
  children,
}: SpecimenFrameProps): ReactElement {
  return (
    <div className="specimen" aria-hidden="true">
      <div className="specimen-inner">
        <div className="specimen-screen">
          <div className="specimen-bar">
            <span className="specimen-dot" />
            <span className="specimen-dot" />
            <span className="specimen-dot" />
            <span className="specimen-label">{label}</span>
          </div>

          <div className="specimen-body">{children}</div>

          <div className="specimen-caption">
            <span>{captionLeft}</span>
            <span>{captionRight}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
