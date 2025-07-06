export interface FooterConfig {
  socialShare: {
    messages: {
      line: string;
      twitter: string;
      facebook: string;
    };
  };
  officialSNS: {
    title: string;
    links: Array<{
      name: string;
      url: string;
      icon: string;
    }>;
  };
  feedback: {
    title: string;
    description: string;
    buttonText: string;
    url: string;
  };
}

export interface SocialShareProps {
  onLineShare: () => void;
  onTwitterShare: () => void;
  onFacebookShare: () => void;
  onCopyUrl: () => void;
}
