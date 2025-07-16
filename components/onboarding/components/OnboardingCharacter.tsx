import { Button } from "@/components/ui/button";
import { onboardingDialogues } from "@/lib/onboarding-texts";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { ANIMATION_DURATION, SCROLL_TEXT, STYLE_CLASSES } from "../constants";
import {
  getButtonText,
  getOnboardingText,
  isFinalScreen,
  sanitizeHtml,
} from "../utils";

interface OnboardingCharacterProps {
  currentDialogue: number;
  isAnimating: boolean;
  onNext: () => void;
  onScrollDown: () => void;
}

/**
 * オンボーディングキャラクターコンポーネント（期日前投票専用）
 * キャラクター画像、コメント、ボタンを表示
 */
export const OnboardingCharacter: React.FC<OnboardingCharacterProps> = ({
  currentDialogue,
  isAnimating,
  onNext,
  onScrollDown,
}) => {
  const dialogue = onboardingDialogues[currentDialogue];
  const isWelcome = dialogue.isWelcome;
  const isFinal = isFinalScreen(currentDialogue, onboardingDialogues.length);

  return (
    <>
      {/* テキストを配置するdiv（吹き出しエリア内に配置） */}
      {!isWelcome && (
        <div className="absolute top-20 max-[375px]:top-8 min-[376px]:max-[639px]:top-24 sm:top-16 left-0 right-0 px-8">
          <div
            className={`transition-opacity duration-300 ease-in-out ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            <p
              className={STYLE_CLASSES.CHARACTER_COMMENT}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: wbrタグのサポートのため、サニタイズ済みHTMLを使用
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(getOnboardingText(dialogue.id)),
              }}
            />
          </div>
        </div>
      )}

      {/* キャラクター画像とボタン */}
      <div className="absolute top-[45%] max-[375px]:top-[50%] left-1/2 transform -translate-x-1/2 sm:top-[35%] md:top-[45%] lg:top-[40%]">
        <div className="relative w-[55vw] h-[55vw] min-[390px]:w-[78vw] min-[390px]:h-[78vw] min-[430px]:w-[100vw] min-[430px]:h-[100vw] sm:w-[45vw] sm:h-[45vw] md:w-[25vw] md:h-[25vw] lg:w-[20vw] lg:h-[20vw] max-w-[16rem] max-h-[16rem]">
          <Image
            src="/img/onboarding/character.svg"
            alt="ガイドキャラクター"
            fill
            className="object-contain"
          />

          {/* welcome.svg（キャラクター基準の右上） */}
          {isWelcome && (
            <div className="absolute top-0 right-0 transform translate-x-[20%] -translate-y-[60%] md:translate-x-[40%] md:-translate-y-[70%] w-[60%] h-[40%] md:w-[50%] md:h-[35%] lg:w-[45%] lg:h-[30%]">
              <Image
                src="/img/onboarding/welcome_master.svg"
                alt="ウェルカム"
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* "次へ"ボタン（キャラクター基準の下） - 詳細画面では非表示 */}
          {!dialogue?.showMissionDetails && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 z-10 mt-8 sm:mt-10 md:mt-12">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onNext}
                  disabled={isAnimating}
                  className={STYLE_CLASSES.BUTTON_PRIMARY}
                >
                  {getButtonText(currentDialogue, isWelcome, isFinal)}
                </Button>
              </motion.div>
            </div>
          )}

          {/* スクロール矢印（詳細表示時のキャラクター下） */}
          {dialogue?.showMissionDetails && (
            <button
              type="button"
              onClick={onScrollDown}
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 cursor-pointer bg-transparent border-none"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: ANIMATION_DURATION.SCROLL_ANIMATION / 1000,
                }}
                className="flex flex-col items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className="text-xs mb-1">{SCROLL_TEXT}</span>
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
