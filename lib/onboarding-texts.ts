export interface OnboardingDialogue {
  id: number;
  text: string;
  isWelcome: boolean;
  showMissionCard?: boolean;
  showMissionDetails?: boolean;
}

export const onboardingDialogues: OnboardingDialogue[] = [
  {
    id: 1,
    text: "",
    isWelcome: true,
  },
  {
    id: 2,
    text: "",
    isWelcome: false,
  },
  {
    id: 3,
    text: "",
    isWelcome: false,
  },
  {
    id: 4,
    text: "",
    isWelcome: false,
  },
  {
    id: 5,
    text: "",
    isWelcome: false,
  },
  {
    id: 6,
    text: "",
    isWelcome: false,
    showMissionDetails: true,
  },
  {
    id: 7,
    text: "",
    isWelcome: false,
  },
];
