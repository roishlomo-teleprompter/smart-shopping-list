import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Shopping-List/",
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
