import DOMPurify from "dompurify";

/**
 * HTMLコンテンツをサニタイズして innerHTML 表示に安全な文字列を返す。
 *
 * ミッション本文のシンクはクライアント ref での innerHTML 代入だけなので、
 * 代入直前にブラウザ DOM 上の DOMPurify を通す。isomorphic-dompurify は
 * モジュール評価時に jsdom を require する。jsdom 30 は html-encoding-sniffer
 * 経由で ESM 専用の @exodus/bytes を読み、Vercel のように require(ESM) が
 * 無効な Node では ERR_REQUIRE_ESM になり /missions/[slug] が 500 になる。
 * 古い jsdom へのピン留めは DOMPurify が依存する DOM 実装の既知の脆弱性を
 * 残すため使わない。DOM が無い環境では未サニタイズの HTML を返さず例外にする。
 *
 * デフォルトの許可集合に加え、ミッション本文のリンクが新しいタブで開くよう
 * target を許可する。target="_blank" には noopener noreferrer を必ず付与する。
 * script・イベントハンドラ属性・javascript: / data: は除去する。
 */
const SANITIZE_CONFIG = { ADD_ATTR: ["target"] };

let blankTargetHookInstalled = false;

function ensureBlankTargetHook() {
  if (blankTargetHookInstalled || typeof DOMPurify.addHook !== "function") {
    return;
  }
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName !== "A" || node.getAttribute("target") !== "_blank") {
      node.removeAttribute("target");
      return;
    }
    const tokens = new Set(
      (node.getAttribute("rel") ?? "").split(/\s+/).filter(Boolean),
    );
    tokens.add("noopener");
    tokens.add("noreferrer");
    node.setAttribute("rel", Array.from(tokens).join(" "));
  });
  blankTargetHookInstalled = true;
}

export const sanitizeHtml = (html: string): string => {
  if (typeof DOMPurify.sanitize !== "function") {
    throw new Error(
      "DOM が無い環境では sanitizeHtml を実行できません。未サニタイズの HTML は返しません。",
    );
  }
  ensureBlankTargetHook();
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
};
