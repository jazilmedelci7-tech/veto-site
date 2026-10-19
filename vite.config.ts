import fs from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En développement, les appels /api vont au serveur. Port lu dans server/.env (4000 par défaut).
function apiPort(): string {
  try {
    const m = /^PORT=(\d+)/m.exec(fs.readFileSync("server/.env", "utf8"));
    if (m?.[1]) return m[1];
  } catch {
    /* pas de .env */
  }
  return "4000";
}
const api = { "/api": `http://localhost:${apiPort()}` };

export default defineConfig({
  plugins: [react()],
  server: { proxy: api },
  preview: { proxy: api },
});
