import type { SectionObservation, SectionPhase, SelectConfig } from "./types";

/**
 * 各セクションの次フェーズを決定する（module-spec.md §2.2）。
 *
 * 純関数。副作用なし・入力が同じなら出力も同じ（不変条件 I-4）。
 * DOM に一切依存しないため、境界条件を単体テストで網羅できる。
 *
 * この関数が本 LP の安定性の中心。ここが正しければ AC-1〜3 は構造的に満たされる。
 */
export function selectPhases(
  observations: readonly SectionObservation[],
  config: SelectConfig,
): Map<string, SectionPhase> {
  const result = new Map<string, SectionPhase>();

  // 1. failed は終端状態。以降の処理から除外する（不変条件 I-2）
  const live: SectionObservation[] = [];
  for (const obs of observations) {
    if (obs.phase === "failed") {
      result.set(obs.id, "failed");
    } else {
      live.push(obs);
    }
  }

  // 2〜3. 活性候補を集め、実効距離を求める
  const candidates: Array<{ obs: SectionObservation; effective: number }> = [];
  for (const obs of live) {
    const isIncumbent = obs.phase === "active";
    const isNewlyEligible = obs.distance < config.activateDistance;
    // 現役はヒステリシス域（releaseDistance まで）に留まれる
    const staysByHysteresis =
      isIncumbent && obs.distance <= config.releaseDistance;

    if (isNewlyEligible || staysByHysteresis) {
      const effective =
        obs.distance - (isIncumbent ? config.incumbentBonus : 0);
      candidates.push({ obs, effective });
    }
  }

  // 4. 決定性のため 3 段でソートする
  candidates.sort(
    (a, b) =>
      a.effective - b.effective ||
      a.obs.distance - b.obs.distance ||
      (a.obs.id < b.obs.id ? -1 : a.obs.id > b.obs.id ? 1 : 0),
  );

  // 5. 上位 capacity 個を active とする（不変条件 I-1 / I-5）
  const limit = Math.max(0, Math.min(config.capacity, candidates.length));
  for (let i = 0; i < limit; i++) {
    result.set(candidates[i].obs.id, "active");
  }

  // 6. 残りは先読み距離で dormant / preloading に振り分ける
  for (const obs of live) {
    if (result.has(obs.id)) continue;
    result.set(
      obs.id,
      obs.distance < config.prefetchDistance ? "preloading" : "dormant",
    );
  }

  return result;
}
