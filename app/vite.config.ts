import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * GitHub Pages 対応（C-1: 公開先は Jumpei-Ishihara の GitHub）
 *
 * base はサイト種別で変わる:
 *   ユーザーサイト   https://jumpei-ishihara.github.io/          → "/"
 *   プロジェクトサイト https://jumpei-ishihara.github.io/<repo>/  → "/<repo>/"
 *
 * 誤ると全アセットが 404 になるため、環境変数で切り替えられるようにしておく。
 *   VITE_BASE=/canvasui-lp/ npm run build
 */
const base = process.env.VITE_BASE ?? "/";

/**
 * 検証ハーネス（lab.html）を成果物に含めるか。
 * 既定は「含めない」。開発用の内部ツールであり、公開物として磨いていないため。
 * 公開したい場合は VITE_INCLUDE_LAB=1 を付ける（noindex は付与済み）。
 */
const includeLab = process.env.VITE_INCLUDE_LAB === "1";

const input: Record<string, string> = {
  main: path.resolve(__dirname, "index.html"),
};
if (includeLab) input.lab = path.resolve(__dirname, "lab.html");

// ADR-3: ルーターを入れず multi-page 構成にする。
// lab.html（検証ハーネス）は LP と同時に読み込まれてはならない（コンテキストを消費するため）。
export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    rollupOptions: { input },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
  },
});
