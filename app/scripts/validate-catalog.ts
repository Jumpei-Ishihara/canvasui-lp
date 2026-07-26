/**
 * ビルド時のカタログ検証（module-spec.md §11 / REQ-1.6 / 1.7）
 *
 * 違反があれば非ゼロ終了してビルドを止める。
 * 特に V-5 は有効: 25 種 × 409 オプションのプロパティ名は取り違えやすく、
 * effectProps が Record<string, unknown> のため型では検出できない。
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { catalog } from "../src/data/catalog";
import { componentMeta, allSlugs } from "../src/data/components.generated";
import { assets } from "../src/data/assets";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(HERE, "../../data");

const errors: string[] = [];
const fail = (v: string, msg: string) => errors.push(`[${v}] ${msg}`);

// ---- V-1: 要素数が 25 -------------------------------------------------
if (catalog.length !== 25) {
  fail("V-1", `catalog の要素数が 25 ではありません: ${catalog.length}`);
}

// ---- V-2: 全 slug が過不足なく登場する --------------------------------
{
  const seen = new Set<string>();
  for (const e of catalog) {
    if (seen.has(e.slug)) fail("V-2", `slug が重複しています: ${e.slug}`);
    if (!componentMeta[e.slug]) fail("V-2", `未知の slug です: ${e.slug}`);
    seen.add(e.slug);
  }
  for (const slug of allSlugs) {
    if (!seen.has(slug)) fail("V-2", `catalog に登場しない slug があります: ${slug}`);
  }
}

// ---- V-3: 同一 interaction が 3 連続しない ----------------------------
{
  let run = 1;
  for (let i = 1; i < catalog.length; i++) {
    const prev = componentMeta[catalog[i - 1].slug]?.interaction;
    const cur = componentMeta[catalog[i].slug]?.interaction;
    run = prev === cur ? run + 1 : 1;
    if (run >= 3) {
      fail(
        "V-3",
        `interaction "${cur}" が 3 連続しています: ` +
          `${catalog[i - 2].slug} → ${catalog[i - 1].slug} → ${catalog[i].slug}`,
      );
    }
  }
}

// ---- V-4: スクロール駆動型が隣接しない --------------------------------
for (let i = 1; i < catalog.length; i++) {
  const a = componentMeta[catalog[i - 1].slug]?.interaction;
  const b = componentMeta[catalog[i].slug]?.interaction;
  if (a === "scroll" && b === "scroll") {
    fail(
      "V-4",
      `スクロール駆動型が隣接しています: ${catalog[i - 1].slug} → ${catalog[i].slug}`,
    );
  }
}

// ---- V-5: effectProps のキーが options.json に実在する -----------------
{
  const options = JSON.parse(
    readFileSync(resolve(DATA, "options.json"), "utf8"),
  ) as Record<string, Array<[string, string, string]>>;

  for (const e of catalog) {
    const known = new Set((options[e.slug] ?? []).map(([k]) => k));
    if (known.size === 0) {
      fail("V-5", `options.json に定義がありません: ${e.slug}`);
      continue;
    }
    for (const key of Object.keys(e.effectProps)) {
      if (!known.has(key)) {
        const stem = key.slice(0, 4).toLowerCase();
        const hint = [...known].filter((k) => k.toLowerCase().includes(stem));
        fail(
          "V-5",
          `${e.slug} に存在しないオプションです: "${key}"` +
            (hint.length ? `（候補: ${hint.join(", ")}）` : ""),
        );
      }
    }
  }
}

// ---- V-6: Object 系の src が assets 経由 -------------------------------
{
  const assetSrcs = new Set(Object.values(assets).map((a) => a.src));
  for (const e of catalog) {
    if (componentMeta[e.slug]?.family !== "object") continue;
    if (!("src" in e.effectProps)) {
      fail("V-6", `${e.slug} に src がありません`);
      continue;
    }
    const src = e.effectProps.src;
    if (typeof src !== "string" || !assetSrcs.has(src)) {
      fail("V-6", `${e.slug} の src が assets 経由ではありません: ${String(src)}`);
    }
  }
}

// ---- 結果 --------------------------------------------------------------
if (errors.length > 0) {
  console.error(`[validate-catalog] ${errors.length} 件の違反:\n`);
  for (const e of errors) console.error(`  ${e}`);
  console.error("");
  process.exit(1);
}

const runs = catalog.map((e) => componentMeta[e.slug].interaction);
console.log(
  `[validate-catalog] OK — ${catalog.length} 件 / V-1〜V-6 すべて合格\n` +
    `  並び: ${runs.join(" ")}`,
);
