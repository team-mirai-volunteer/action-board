"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { onboardingDialogues } from "@/lib/onboarding-texts";
import { cn } from "@/lib/utils/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (currentDialogue < onboardingDialogues.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentDialogue(currentDialogue + 1);
        setIsAnimating(false);
      }, 150);
    } else if (currentDialogue === onboardingDialogues.length - 1) {
      onOpenChange(false);
      setCurrentDialogue(0);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setCurrentDialogue(0);
      setIsAnimating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-4 md:inset-6 lg:inset-12 z-50 duration-200",
            "lg:max-w-4xl lg:mx-auto lg:left-0 lg:right-0",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>オンボーディング</DialogPrimitive.Title>
          </VisuallyHidden.Root>
          <div className="relative w-full h-full bg-gradient-to-b from-[#A8E6CF] to-[#7FCDCD] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* 閉じるボタンのみ */}
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            >
              <X className="h-8 w-8" />
            </button>

            {/* コンテンツエリア - 背景画像の上にテキストとボタンdivを配置 */}
            <div className="relative flex-1 overflow-hidden">
              {/* 背景画像 */}
              <div className="relative w-full h-full">
                <Image
                  src="/img/onboarding/background-only.svg"
                  alt="オンボーディング背景"
                  fill
                  className="object-fill"
                />
              </div>

              {/* 1P目以外：吹き出し画像 */}
              {!onboardingDialogues[currentDialogue].isWelcome && (
                <div className="absolute top-0 left-0 w-full h-full">
                  <Image
                    src="/img/onboarding/speech-bubble.svg"
                    alt="吹き出し"
                    fill
                    className="object-fill"
                  />
                </div>
              )}

              {/* 1P目：welcome画面 */}
              {onboardingDialogues[currentDialogue].isWelcome && (
                <>
                  {/* キャラクターの上部にロゴとテキスト */}
                  <div className="absolute top-20 md:top-16 lg:top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4">
                    {/* ロゴ */}
                    <div className="relative w-[40vw] h-[20vw] min-[390px]:w-[48vw] min-[390px]:h-[24vw] min-[430px]:w-[56vw] min-[430px]:h-[28vw] sm:w-[36vw] sm:h-[18vw] md:w-[20vw] md:h-[10vw] lg:w-[16vw] lg:h-[8vw] max-w-[12rem] max-h-[6rem]">
                      <Image
                        src="/img/logo.png"
                        alt="チームみらいロゴ"
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* アクションボードテキスト */}
                    <h5 className="text-black text-base sm:text-lg md:text-base lg:text-lg font-bold tracking-wider w-[40vw] sm:w-24 md:w-40 lg:w-44 text-center">
                      アクションボード
                    </h5>
                  </div>
                </>
              )}

              {/* テキストを配置するdiv（吹き出しエリア内に配置） */}
              {!onboardingDialogues[currentDialogue].isWelcome && (
                <div className="absolute top-20 max-[375px]:top-12 min-[376px]:max-[639px]:top-24 sm:top-16 left-0 right-0 px-8">
                  <div
                    className={`transition-opacity duration-300 ease-in-out ${
                      isAnimating ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed text-center font-medium px-4 py-2 whitespace-pre-line">
                      {onboardingDialogues[currentDialogue].text}
                    </p>
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
                  {onboardingDialogues[currentDialogue].isWelcome && (
                    <div className="absolute top-0 right-0 transform translate-x-[20%] -translate-y-[60%] md:translate-x-[40%] md:-translate-y-[70%] w-[60%] h-[40%] md:w-[50%] md:h-[35%] lg:w-[45%] lg:h-[30%]">
                      <Image
                        src="/img/onboarding/welcome_master.svg"
                        alt="ウェルカム"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* "次へ"ボタン（キャラクター基準の下） */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-8 sm:mt-10 md:mt-12 z-10">
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={handleNext}
                        disabled={isAnimating}
                        className="bg-white text-gray-800 hover:bg-white/90 text-base py-3 rounded-full shadow-lg font-medium w-[40vw] sm:w-24 md:w-40 lg:w-44"
                      >
                        {currentDialogue === 0 &&
                        onboardingDialogues[currentDialogue].isWelcome
                          ? "はじめる"
                          : currentDialogue === onboardingDialogues.length - 1
                            ? "始める"
                            : "次へ"}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
