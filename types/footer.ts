/** フッターリンクの定義 */
export interface FooterLink {
  title: string;
  description: string;
  url: string;
  public: boolean;
}

/** アコーディオンセクションの定義 */
export interface FooterAccordionSection {
  value: string;
  title: string;
  defaultOpen: boolean;
  links: FooterLink[];
}
