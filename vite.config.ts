import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/Shopping-List/" : "/",
  plugins: [react()],
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
}));
