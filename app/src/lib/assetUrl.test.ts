import { describe, expect, it } from "vitest";
import { assetUrl } from "./assetUrl";

/**
 * ソースを import.meta.glob で集める。
 * Vite が設定上のルート基準で解決するため、起動ディレクトリに依存しない。
 * ベンダー（canvasui）は改変対象外なので除外する。
 */
const SOURCES = import.meta.glob("/src/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

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
  const PUBLIC_DIRS = ["svg", "models", "images", "draco"];

  it("素の絶対パスで public 配下を参照しているファイルが無い", () => {
    const pattern = new RegExp(`["'\`]/(${PUBLIC_DIRS.join("|")})/`);
    const offenders: string[] = [];

    for (const [path, code] of Object.entries(SOURCES)) {
      if (path.includes("/components/canvasui/")) continue; // ベンダーは対象外
      if (/\.test\.tsx?$/.test(path)) continue;

      for (const [i, line] of code.split("\n").entries()) {
        if (line.includes("assetUrl(")) continue;      // 通していれば OK
        if (/^\s*(\*|\/\/)/.test(line)) continue;      // 説明コメントは対象外
        if (pattern.test(line)) {
          offenders.push(`${path}:${i + 1}  ${line.trim().slice(0, 80)}`);
        }
      }
    }

    expect(
      offenders,
      `public 配下は assetUrl() を通すこと:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("走査対象のファイルを実際に集められている（空振り防止）", () => {
    const targets = Object.keys(SOURCES).filter(
      (p) => !p.includes("/components/canvasui/"),
    );
    expect(targets.length).toBeGreaterThan(15);
  });
});

