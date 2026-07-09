import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works when served from a GitHub Pages
// project subpath (https://<user>.github.io/<repo>/) as well as from
// a custom domain root, without any extra configuration.
export default defineConfig({
  base: "/vespers/",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
