import type { ReactElement } from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HomePage } from "./pages/HomePage";
import { NeonBlocksPage } from "./pages/NeonBlocksPage";
import { TicTacToePage } from "./pages/TicTacToePage";
import { NeuralGridPage } from "./pages/NeuralGridPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App(): ReactElement {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <div className="ambient-gradient" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <Navbar />

      <div id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games/neon-blocks" element={<NeonBlocksPage />} />
          <Route path="/games/tic-tac-toe" element={<TicTacToePage />} />
          <Route path="/games/neural-grid" element={<NeuralGridPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}
