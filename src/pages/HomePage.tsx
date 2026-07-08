import type { ReactElement } from "react";
import { Hero } from "../components/home/Hero";
import { Carousel } from "../components/home/Carousel";
import { Mission } from "../components/home/Mission";

export function HomePage(): ReactElement {
  return (
    <>
      <Hero />

      <main id="games">
        <section className="section-title container">
          <span>The Rites</span>
          <h2>Three Small Ceremonies</h2>
        </section>

        <Carousel />
        <Mission />
      </main>
    </>
  );
}
