import DOMPurify from "isomorphic-dompurify";

/**
 * HTMLコンテンツをサニタイズして innerHTML 表示に安全な文字列を返す。
 *
 * DOMPurify のデフォルト設定で、p / strong / em / ul / li / a / svg などの一般的な
 * 整形タグは保持しつつ、script タグ・イベントハンドラ属性・javascript:/data: 等の
 * 危険な入力を除去する。ミッション本文のようなリッチテキストを innerHTML で
 * 描画する前に通すことで、将来 content が下位権限で書込可能になっても
 * stored XSS を防ぐ。
 */
export const sanitizeHtml = (html: string): string => DOMPurify.sanitize(html);
