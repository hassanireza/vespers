import type { ReactElement } from "react";
import "./Mission.css";

export function Mission(): ReactElement {
  return (
    <section className="bottom-panel container" id="about">
      <div className="panel-card">
        <span>On Stillness</span>
        <h3>The image should feel almost static.</h3>
        <p>
          Every screen here favours restraint over spectacle: near-black grounds,
          a single desaturated accent per rite, grain instead of gloss. Motion is
          kept shallow, deliberate, closer to a held breath than an animation.
        </p>
      </div>

      <div className="panel-card">
        <span>On Craft</span>
        <h3>The engine is unchanged beneath the surface.</h3>
        <p>
          Each rite still runs on a typed, object oriented engine underneath its
          new skin: the same rules, the same logic, dressed differently. What
          changed is only what you see, not what you play.
        </p>
      </div>
    </section>
  );
}
