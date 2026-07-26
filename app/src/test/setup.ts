import "@testing-library/jest-dom/vitest";

/**
 * jsdom は matchMedia を実装していない。
 * 本番のブラウザには必ず存在するため、実装側に防御コードを入れるのではなく
 * テスト環境側で補う。
 */
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

/**
 * vitest の globals を有効にしていないため、@testing-library/react の
 * 自動クリーンアップが登録されない。明示的に登録する。
 * （これが無いと前のテストの DOM が残り getByText が複数一致する）
 */
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
