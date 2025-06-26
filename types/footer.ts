export interface FooterLink {
  title: string;
  description: string;
  url: string;
  public: boolean;
}

export interface FooterAccordionStyling {
  containerClassName: string;
  linkClassName: string;
  titleClassName: string;
  descriptionClassName: string;
}

export interface FooterAccordionContent {
  links: FooterLink[];
}

export interface FooterAccordionSection {
  value: string;
  title: string;
  contentType: "links";
  defaultOpen: boolean;
  requiresAuth: boolean;
  styling: FooterAccordionStyling;
  content: FooterAccordionContent;
}

export type FooterAccordionSections = FooterAccordionSection[];

export interface FooterSNSLinks {
  line: string;
  youtube: string;
  twitter: string;
  instagram: string;
  facebook: string;
  note: string;
}

export type FooterSNSPlatform = keyof FooterSNSLinks;

export interface FooterImages {
  basePath: string;
  icons: {
    line: string;
    youtube: string;
    twitter: string;
    instagram: string;
    facebook: string;
    note: string;
  };
}

export interface FooterConfig {
  socialShare: {
    message: string;
  };
  snsLinks: FooterSNSLinks;
  images: FooterImages;
  feedback: {
    url: string;
  };
  accordionSections: FooterAccordionSection[];
}
