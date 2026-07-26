import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { assetUrl } from "./assetUrl";

describe("assetUrl", () => {
  it("public 配下のパスに base を付ける", () => {
    // テスト時の BASE_URL は "/"
    expect(assetUrl("/svg/x.svg")).toBe("/svg/x.svg");
    expect(assetUrl("svg/x.svg")).toBe("/svg/x.svg");
    expect(assetUrl("//svg/x.svg")).toBe("/svg/x.svg");
  });

  it("空文字は空文字のまま返す（素材未確定のプレースホルダ用）", () => {
    expect(assetUrl("")).toBe("");
  });

  it("外部 URL と data / blob URL はそのまま通す（M4 のアップロード素材）", () => {
    expect(assetUrl("https://example.com/a.glb")).toBe("https://example.com/a.glb");
    expect(assetUrl("blob:http://localhost/abc")).toBe("blob:http://localhost/abc");
    expect(assetUrl("data:image/png;base64,AAA")).toBe("data:image/png;base64,AAA");
  });
});

/**
 * 再発防止（本番で /svg/test-shape.svg が 404 になった件）
 *
 * public 配下を素の絶対パスで書くと Vite の base が付かず、
 * GitHub Pages のプロジェクトサイト（base="/canvasui-lp/"）で 404 になる。
 * base="/" のローカルでは動いてしまうため、静的に検出する。
 */
describe("public 配下の参照は必ず assetUrl を通す", () => {
  const SRC = resolve(process.cwd(), "src");
  const PUBLIC_DIRS = ["svg", "models", "images", "draco"];

  function walk(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) {
        // ベンダー（Canvas UI 本体）は改変しないので対象外
        if (name === "canvasui") continue;
        walk(p, out);
      } else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) {
        out.push(p);
      }
    }
    return out;
  }

  it("素の絶対パスで public 配下を参照しているファイルが無い", () => {
    const pattern = new RegExp(`["'\`]/(${PUBLIC_DIRS.join("|")})/`);
    const offenders: string[] = [];

    for (const file of walk(SRC)) {
      const code = readFileSync(file, "utf8");
      for (const [i, line] of code.split("\n").entries()) {
        // assetUrl("...") の中なら OK
        if (line.includes("assetUrl(")) continue;
        // 説明コメントは対象外
        if (/^\s*(\*|\/\/)/.test(line)) continue;
        if (pattern.test(line)) {
          offenders.push(
            `${file.replace(SRC, "src")}:${i + 1}  ${line.trim().slice(0, 80)}`,
          );
        }
      }
    }

    expect(
      offenders,
      `public 配下は assetUrl() を通すこと:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});
