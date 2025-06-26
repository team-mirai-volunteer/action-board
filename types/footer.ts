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
}
