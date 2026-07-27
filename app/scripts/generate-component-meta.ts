/**
 * components.generated.ts を生成する（ADR-5 / module-spec.md §10）
 *
 * 入力: ../data/registry.json（150 items）、../data/options.json
 * 出力: src/data/components.generated.ts
 * 実行: npm run gen:meta
 *
 * 25 種 × 409 オプションを手書きすると必ず実態と乖離するため機械生成する。
 * 生成物はコミットし、ビルド時にネットワークへ依存しない。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { InteractionKind } from "../src/data/componentMeta.types";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(HERE, "../../data");
const OUT = resolve(HERE, "../src/data/components.generated.ts");
const VENDOR = resolve(HERE, "../src/components/canvasui");

/**
 * タッチ環境での制約を、ベンダーソースを走査して機械判定する。
 *
 * - pointerDependent: pointer / mouse 系のリスナーを持つ
 * - touchReady      : touch-action を指定している
 *
 * touch-action の指定が無いとブラウザがスクロールジェスチャを優先し、
 * 指でなぞってもポインタストリームが pointercancel で途切れる。
 * さらにタッチにはホバーが無いため、カーソル追従型は実用上ほぼ効かない。
 * 推測ではなく実ソースから判定する（手書きだと実態と乖離するため）。
 */
function scanTouchSupport(name: string): { pointerDependent: boolean; touchReady: boolean } {
  let code: string;
  try {
    code = readFileSync(resolve(VENDOR, `${name}.tsx`), "utf8");
  } catch {
    fail(`ベンダーソースが見つかりません: ${name}.tsx（先に shadcn add を実行すること）`);
  }
  const pointerDependent =
    /addEventListener\(\s*"(pointer(move|down)|mouse(move|down)|click)"/.test(code);
  const touchReady = /touchAction\s*:/.test(code);
  return { pointerDependent, touchReady };
}

/**
 * interaction のみ自動導出できないため定数表として持つ。
 * 根拠: docs/03-combination-research.md §3（イベント購読の全数調査）
 */
const INTERACTION: Record<string, InteractionKind> = {
  // ambient — ポインタ購読なし
  blaze: "ambient",
  glitch: "ambient",
  vhs: "ambient",
  "dithered-object": "ambient",
  "glass-object": "ambient",
  // lens — カーソル追従の局所効果
  glass: "lens",
  magnify: "lens",
  bubble: "lens",
  "retro-dither": "lens",
  asciify: "lens",
  "particle-reveal": "lens",
  // field — ポインタで乱れる場
  liquid: "field",
  ripple: "field",
  droplets: "field",
  frost: "field",
  cloth: "field",
  clouds: "field",
  "particle-object": "field",
  // geometry — ジオメトリ変形
  shatter: "geometry",
  grid: "geometry",
  "hex-float": "geometry",
  peel: "geometry",
  // scroll — スクロール量を占有
  laser: "scroll",
  "particle-scroll": "scroll",
  bend: "scroll",
};

interface RegistryItem {
  name: string;
  title: string;
  description: string;
  dependencies?: string[] | null;
  files: Array<{ path: string; target?: string }>;
}

function main() {
  const registry = JSON.parse(
    readFileSync(resolve(DATA, "registry.json"), "utf8"),
  ) as { items: RegistryItem[] };
  const options = JSON.parse(
    readFileSync(resolve(DATA, "options.json"), "utf8"),
  ) as Record<string, unknown[]>;

  const reactItems = registry.items.filter((i) => i.name.endsWith("-react"));
  if (reactItems.length !== 25) {
    fail(`React 実装が 25 件ではありません: ${reactItems.length} 件`);
  }

  const rows = reactItems
    .map((item) => {
      const slug = item.name.slice(0, -"-react".length);
      const interaction = INTERACTION[slug];
      if (!interaction) {
        fail(`interaction が未定義の slug です: ${slug}`);
      }
      const requiresThree = (item.dependencies ?? []).includes("three");
      const family = requiresThree ? "object" : "wrapper";
      // ファイル名から PascalCase 名を得る（例: components/canvasui/HexFloat.tsx → HexFloat）
      const filePath = item.files[0]?.target ?? item.files[0]?.path ?? "";
      const name = filePath.split("/").pop()?.replace(/\.tsx$/, "") ?? slug;
      const { pointerDependent, touchReady } = scanTouchSupport(name);
      const optionCount = options[slug]?.length ?? 0;
      if (optionCount === 0) {
        fail(`オプションが 0 件です: ${slug}`);
      }
      return {
        slug,
        name,
        family,
        interaction,
        description: item.description,
        optionCount,
        requiresThree,
        requiresAsset: family === "object",
        acceptsChildren: family === "wrapper",
        installCommand: `npx shadcn@latest add @canvas-ui/${slug}-react`,
        docsUrl: `https://canvasui.dev/docs/components/${slug}`,
        pointerDependent,
        touchReady,
        touchLimited: pointerDependent && !touchReady,
      };
    })
    .sort((a, b) => (a.slug < b.slug ? -1 : 1));

  const body = rows
    .map(
      (r) => `  ${JSON.stringify(r.slug)}: {
    slug: ${JSON.stringify(r.slug)},
    name: ${JSON.stringify(r.name)},
    family: ${JSON.stringify(r.family)},
    interaction: ${JSON.stringify(r.interaction)},
    description: ${JSON.stringify(r.description)},
    optionCount: ${r.optionCount},
    requiresThree: ${r.requiresThree},
    requiresAsset: ${r.requiresAsset},
    acceptsChildren: ${r.acceptsChildren},
    installCommand: ${JSON.stringify(r.installCommand)},
    docsUrl: ${JSON.stringify(r.docsUrl)},
    pointerDependent: ${r.pointerDependent},
    touchReady: ${r.touchReady},
    touchLimited: ${r.touchLimited},
  },`,
    )
    .join("\n");

  const out = `// AUTO-GENERATED — DO NOT EDIT. Run: npm run gen:meta
// 生成元: data/registry.json (150 items) + data/options.json
import type { ComponentMeta } from "./componentMeta.types";

export const componentMeta: Record<string, ComponentMeta> = {
${body}
};

/** 全 slug（アルファベット順）。表示順は data/catalog.ts が持つ */
export const allSlugs: readonly string[] = Object.keys(componentMeta);

export const COMPONENT_COUNT = ${rows.length};
`;

  writeFileSync(OUT, out, "utf8");
  const objects = rows.filter((r) => r.family === "object").length;
  const totalOptions = rows.reduce((s, r) => s + r.optionCount, 0);
  const touchLimited = rows.filter((r) => r.touchLimited);
  console.log(
    `生成: ${rows.length} 件（wrapper ${rows.length - objects} / object ${objects}）` +
      `、総オプション ${totalOptions}\n` +
      `タッチ制約あり: ${touchLimited.length} 件 — ${touchLimited.map((r) => r.name).join(", ")}\n` +
      `出力: ${OUT}`,
  );
}

function fail(message: string): never {
  console.error(`[generate-component-meta] ${message}`);
  process.exit(1);
}

main();
