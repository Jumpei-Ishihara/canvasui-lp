import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { allSlugs, componentMeta } from "@/data/components.generated";
import { loadEffect } from "@/core/effectRegistry";
import { detectHtmlInCanvas } from "@/core/SupportContext";
import { box, button, h2, label, note } from "./ui";

/**
 * T-1 / T-8 / T-9 の自動実行
 *
 * 25 種を 1 つずつマウントし、次を機械的に判定する:
 *  - html-in-canvas が実際に噛んでいるか（source canvas が layoutsubtree で可視、子を持つ）
 *  - 出力キャンバスが生成され、寸法を持つか
 *  - マウント中の fps
 *  - 例外の有無
 *
 * 手で 25 回クリックする代わりに 1 回で終わり、結果は JSON で持ち出せる。
 */

interface Row {
  slug: string;
  name: string;
  family: string;
  /** html-in-canvas が噛んだか。Object 系は n/a */
  engaged: boolean | null;
  /** canvas の寸法 */
  canvas: string;
  fps: number;
  error: string | null;
  verdict: "ok" | "ng" | "fallback";
}

const SETTLE_MS = 1300;

const Subject = () => (
  <div style={{ padding: 24 }}>
    <h3 style={{ fontSize: "1.75rem", margin: 0 }}>Canvas UI</h3>
    <p style={{ color: "var(--color-muted)" }}>自動検証中の被写体です。</p>
    <button type="button">クリック可能</button>
  </div>
);

export function AutoRunner() {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Root | null>(null);
  const abortRef = useRef(false);

  const supported = detectHtmlInCanvas();
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    return () => {
      abortRef.current = true;
      // React の警告を避けるため次のタスクで unmount する
      const r = rootRef.current;
      rootRef.current = null;
      if (r) setTimeout(() => r.unmount(), 0);
    };
  }, []);

  const run = useCallback(async () => {
    if (!hostRef.current) return;
    abortRef.current = false;
    setRunning(true);
    setRows([]);

    const host = hostRef.current;
    const out: Row[] = [];

    for (const slug of allSlugs) {
      if (abortRef.current) break;
      const meta = componentMeta[slug];
      setCurrent(meta.name);

      // 前回分を確実に破棄してから次を載せる（コンテキストを溜めない）
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
      host.innerHTML = "";
      const mountPoint = document.createElement("div");
      mountPoint.style.cssText = "position:relative;width:100%;height:100%;";
      host.appendChild(mountPoint);

      type AnyProps = Record<string, unknown> & { children?: ReactNode };
      let error: string | null = null;
      let Effect: ComponentType<AnyProps> | null = null;
      try {
        const mod = await loadEffect(slug);
        Effect = mod.default as unknown as ComponentType<AnyProps>;
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }

      if (Effect) {
        const E = Effect;
        const onError = (e: ErrorEvent) => {
          error = error ?? e.message;
        };
        window.addEventListener("error", onError);
        try {
          const root = createRoot(mountPoint);
          rootRef.current = root;
          root.render(
            meta.family === "object" ? (
              <E src="" background="" style={{ width: "100%", height: "100%" }} />
            ) : (
              <E style={{ width: "100%", height: "100%" }}>
                <Subject />
              </E>
            ),
          );
        } catch (e) {
          error = e instanceof Error ? e.message : String(e);
        }
        window.removeEventListener("error", onError);
      }

      // 安定を待ちつつ fps を測る
      const fps = await measureFps(SETTLE_MS);

      // html-in-canvas が実際に噛んでいるかを判定する。
      // Wrapper 系は native のとき source canvas に layoutsubtree が付き、
      // 表示されたまま子要素（実 DOM）を内包する。
      let engaged: boolean | null = null;
      if (meta.family === "wrapper") {
        const src = mountPoint.querySelector("canvas[layoutsubtree]");
        engaged =
          !!src &&
          getComputedStyle(src as Element).display !== "none" &&
          (src as Element).children.length > 0;
      }

      const canvases = [...mountPoint.querySelectorAll("canvas")];
      const sized = canvases.find((c) => c.clientWidth > 0 && c.clientHeight > 0);
      const canvas = sized ? `${sized.clientWidth}×${sized.clientHeight}` : "なし";

      const verdict: Row["verdict"] = error
        ? "ng"
        : meta.family === "object"
          ? sized ? "ok" : "ng"
          : engaged ? "ok" : "fallback";

      out.push({
        slug,
        name: meta.name,
        family: meta.family,
        engaged,
        canvas,
        fps,
        error,
        verdict,
      });
      setRows([...out]);
    }

    if (rootRef.current) {
      rootRef.current.unmount();
      rootRef.current = null;
    }
    if (hostRef.current) hostRef.current.innerHTML = "";
    setCurrent(null);
    setRunning(false);
  }, []);

  const summary = {
    実施日時: new Date().toISOString(),
    "html-in-canvas": supported ? "有効" : "無効",
    "prefers-reduced-motion": reduced ? "有効" : "無効",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    ok: rows.filter((r) => r.verdict === "ok").length,
    fallback: rows.filter((r) => r.verdict === "fallback").length,
    ng: rows.filter((r) => r.verdict === "ng").length,
    最低fps: rows.length ? Math.min(...rows.map((r) => r.fps)) : null,
    結果: rows.map((r) => ({
      slug: r.slug,
      verdict: r.verdict,
      engaged: r.engaged,
      canvas: r.canvas,
      fps: r.fps,
      error: r.error,
    })),
  };

  return (
    <section style={box}>
      <h2 style={h2}>T-1 / T-8 / T-9 — 自動実行</h2>
      <p style={note}>
        25 種を 1 つずつマウントして機械判定します（所要 40 秒ほど）。
        <strong> html-in-canvas が実際に噛んでいるか</strong>まで確認するので、
        目視より確実です。終わったら結果 JSON をコピーして共有してください。
      </p>

      <div style={{ display: "flex", gap: "var(--sp-4)", alignItems: "center", margin: "var(--sp-5) 0", flexWrap: "wrap" }}>
        <button style={button} onClick={run} disabled={running}>
          {running ? `実行中… ${current ?? ""}` : "自動検証を実行"}
        </button>
        {rows.length > 0 && (
          <>
            <Pill color="var(--color-ok)" text={`OK ${summary.ok}`} />
            <Pill color="var(--color-warn)" text={`フォールバック ${summary.fallback}`} />
            <Pill color="var(--color-danger)" text={`NG ${summary.ng}`} />
            <span style={{ color: "var(--color-muted)", fontSize: ".875rem" }}>
              最低 fps {summary.最低fps}
            </span>
            <button
              style={{ ...button, background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-fg)" }}
              onClick={() => navigator.clipboard.writeText(JSON.stringify(summary, null, 2))}
            >
              結果 JSON をコピー
            </button>
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "var(--sp-5)", alignItems: "start" }}>
        <div style={{ maxHeight: 420, overflow: "auto", border: "1px solid var(--color-border)", borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".8125rem" }}>
            <thead>
              <tr style={{ position: "sticky", top: 0, background: "var(--color-raised)" }}>
                {["#", "コンポーネント", "判定", "HIC", "canvas", "fps"].map((h) => (
                  <th key={h} style={{ ...label, padding: "8px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.slug} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={td}>{i + 1}</td>
                  <td style={td}>
                    {r.name}
                    {r.error && (
                      <div style={{ color: "var(--color-danger)", fontSize: ".75rem" }}>{r.error}</div>
                    )}
                  </td>
                  <td style={{ ...td, color: verdictColor(r.verdict) }}>{verdictLabel(r.verdict)}</td>
                  <td style={td}>{r.engaged === null ? "—" : r.engaged ? "噛んだ" : "落ちた"}</td>
                  <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{r.canvas}</td>
                  <td style={{ ...td, fontFamily: "var(--font-mono)", color: r.fps >= 50 ? "var(--color-ok)" : "var(--color-warn)" }}>
                    {r.fps}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td style={{ ...td, color: "var(--color-dim)" }} colSpan={6}>未実行</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          ref={hostRef}
          style={{
            position: "relative", overflow: "hidden", height: 420,
            border: "1px solid var(--color-border)", borderRadius: 8,
            background: "var(--color-surface)",
          }}
        />
      </div>

      <p style={note}>
        <strong>判定の意味</strong> — OK: エフェクトが実際に描画された /
        フォールバック: 素の HTML に落ちた（非対応環境では正常。<strong>これが T-8</strong>）/
        NG: 例外または canvas 未生成。
        {reduced && <strong style={{ color: "var(--color-warn)" }}> reduced-motion 有効のため T-9 の確認になります。</strong>}
      </p>
    </section>
  );
}

function Pill({ color, text }: { color: string; text: string }) {
  return (
    <span style={{ color, fontFamily: "var(--font-mono)", fontSize: ".875rem" }}>{text}</span>
  );
}

/**
 * fps を測る。
 *
 * 【重要】バックグラウンドのタブでは Chrome が rAF を強くスロットリングする。
 * rAF だけで待つと 1 件あたり十数秒かかり、検証が実質的に進まなくなる。
 * setTimeout と競争させ、必ず ms 程度で決着させる。
 * 返り値が極端に低い場合はタブが非表示だった可能性がある（画面側で注記する）。
 */
function measureFps(ms: number): Promise<number> {
  return new Promise((resolve) => {
    let frames = 0;
    let settled = false;
    const start = performance.now();
    const finish = () => {
      if (settled) return;
      settled = true;
      const elapsed = performance.now() - start;
      resolve(Math.round((frames * 1000) / Math.max(elapsed, 1)));
    };
    const tick = () => {
      frames++;
      if (performance.now() - start >= ms) return finish();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(finish, ms + 200);
  });
}

const verdictLabel = (v: Row["verdict"]) =>
  v === "ok" ? "OK" : v === "fallback" ? "フォールバック" : "NG";
const verdictColor = (v: Row["verdict"]) =>
  v === "ok" ? "var(--color-ok)" : v === "fallback" ? "var(--color-warn)" : "var(--color-danger)";

const td: React.CSSProperties = { padding: "8px", verticalAlign: "top" };
