/**
 * HTMLコンテンツをサニタイズする関数（wbr、br、a、svg、path、polyline、line タグを許可）
 *
 * 注意: regex ベースの軽量サニタイザで、属性のスクラブは限定的（イベントハンドラと
 * javascript: スキームの除去のみ）。ミッション本文・オンボーディング本文のような
 * 信頼済みデータを innerHTML で表示する際の防御層として用いる。より強固な
 * サニタイズが必要になったら DOMPurify 等への置き換えを検討する。
 */
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/\n/g, "<br>")
    .replace(
      /<(?!\/?(wbr|br|a|svg|path|polyline|line)(?:\s[^>]*)?\/?>)[^>]*>/g,
      "",
    ) // 許可されたタグ以外を除去
    .replace(/javascript:/gi, "") // JavaScriptスキームを除去
    .replace(/on\w+\s*=/gi, ""); // イベントハンドラ属性を除去
};
