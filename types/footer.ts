/** フッターリンクの定義 */
export interface FooterLink {
  title: string; // リンクのタイトル
  description: string; // リンクの説明文
  url: string; // リンク先URL
  public: boolean; // 認証不要で表示するかどうか
}

/** アコーディオンのスタイリング設定 */
export interface FooterAccordionStyling {
  containerClassName: string; // コンテナのCSSクラス
  linkClassName: string; // リンクのCSSクラス
  titleClassName: string; // タイトルのCSSクラス
  descriptionClassName: string; // 説明文のCSSクラス
}

/** アコーディオンのコンテンツ */
export interface FooterAccordionContent {
  links: FooterLink[]; // リンクの配列
}

/** アコーディオンセクションの定義 */
export interface FooterAccordionSection {
  value: string; // セクションの識別子
  title: string; // セクションのタイトル
  contentType: "links"; // コンテンツタイプ（現在はlinksのみ）
  defaultOpen: boolean; // 初期状態で開いているかどうか
  requiresAuth: boolean; // セクション表示に認証が必要かどうか
  styling: FooterAccordionStyling; // スタイリング設定
  content: FooterAccordionContent; // コンテンツ
}

export type FooterAccordionSections = FooterAccordionSection[];
