"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MissionIcon } from "@/components/ui/mission-icon";
import { Textarea } from "@/components/ui/textarea";
import { onboardingDialogues } from "@/lib/onboarding-texts";
import { cn } from "@/lib/utils/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmissionCompleted, setIsSubmissionCompleted] = useState(false);
  const [artifactText, setArtifactText] = useState("");
  const [artifactDescription, setArtifactDescription] = useState("");
  const [missionType] = useState<"early-vote">("early-vote");
  const contentRef = useRef<HTMLDivElement>(null);

  // HTMLコンテンツをサニタイズする関数（wbrタグのみ許可）
  const sanitizeHtml = (html: string) => {
    return html
      .replace(/\n/g, "<br>")
      .replace(/<(?!\/?(wbr|br)(?:\s[^>]*)?\/?>)[^>]*>/g, ""); // wbrとbr以外のタグを除去
  };

  // ミッションのモックデータ
  const mockMissions = {
    "early-vote": {
      id: "3",
      title: "期日前投票をしよう！",
      artifact_label: null,
      content:
        "<p>予定が合わない方も安心！</p><p>みんなで投票率アップを目指そう！</p>",
      icon_url:
        "/img/mission-icons/actionboard_icon_work_20250713_ol_early-vote.svg",
      difficulty: 5,
      max_achievement_count: 1,
      event_date: null,
      required_artifact_type: "NONE",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_featured: false,
      is_hidden: false,
      ogp_image_url: null,
    },
  };

  const mockArtifactLabels = {
    "early-vote": "",
  };

  const mockMission = mockMissions[missionType];
  const mockArtifactLabel = mockArtifactLabels[missionType];

  // ミッションタイプごとのオンボーディングテキストの定義
  const missionOnboardingTexts = {
    "early-vote": {
      2: "ここは、アクション<wbr>ボード。チームみらいを応援する者たちが集いし場所。\n\nわしは、このアクション<wbr>ボードの主、アクション仙人じゃ。",
      3: "このアプリではの、チラシ配り、イベント手伝い、ポスター貼り… あらゆる「応援のカタチ」を、気軽に、楽しく、こなせるようになっとる。",
      4: "何をすればええか分からん？心配いらん。ちょいとした気軽なアクションも揃えとるから、初めてでも心配いらんぞい。",
      5: "ではさっそく、初めてのアクションじゃ。\nまずは、期日前<wbr>投票について学んで、選挙参加の準備をしてみるとええ。",
      6: "「期日前<wbr>投票をしよう！」\n\nこのミッションでは、ボタンを押すだけで自動的にミッション<wbr>クリアじゃ！\n\n下のボタンから挑戦してみるとええ！",
      7: "うむ、上出来じゃ！\n\n実際のミッションでは、提出すると経験値がもらえて、レベルアップもできるぞい。\nさあ、アクションボードでみらいを切り開くのじゃ！",
    },
  } as const;

  // ミッションタイプに応じたオンボーディングテキストを取得
  const getDynamicOnboardingText = (dialogue: {
    id: number;
    text: string;
    showScrollDown?: boolean;
    showNewButton?: boolean;
    showMissionCard?: boolean;
    showMissionDetails?: boolean;
    showPartyPeople?: boolean;
  }) => {
    const customTexts = missionOnboardingTexts[missionType];

    if (customTexts && dialogue.id in customTexts) {
      return customTexts[dialogue.id as keyof typeof customTexts];
    }

    // デフォルトテキストは使用しない
    return "";
  };

  // 画面遷移時にスクロール位置をトップにリセット
  useEffect(() => {
    // ミッション詳細画面以外、またはアニメーション完了後にスクロールリセット
    if (
      contentRef.current &&
      !onboardingDialogues[currentDialogue]?.showMissionDetails
    ) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentDialogue]);

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
      setIsSubmissionCompleted(false);
    }
  };

  const handleScrollDown = () => {
    if (contentRef.current) {
      // ミッション詳細画面の場合はカードのボトムが見える位置までスクロール
      if (onboardingDialogues[currentDialogue]?.showMissionDetails) {
        const missionDetailCard = contentRef.current.querySelector(
          "[data-mission-detail-card]",
        );
        if (missionDetailCard) {
          const cardBottom = missionDetailCard.getBoundingClientRect().bottom;
          const containerTop = contentRef.current.getBoundingClientRect().top;
          const scrollAmount =
            cardBottom - containerTop - contentRef.current.clientHeight + 20; // 20pxの余白

          if (scrollAmount > 0) {
            contentRef.current.scrollTo({
              top: contentRef.current.scrollTop + scrollAmount,
              behavior: "smooth",
            });
          }
        }
      } else {
        // それ以外の場合は300px下にスクロール
        const scrollHeight = contentRef.current.scrollHeight;
        const clientHeight = contentRef.current.clientHeight;
        const scrollTarget = Math.min(scrollHeight - clientHeight, 300);

        contentRef.current.scrollTo({
          top: scrollTarget,
          behavior: "smooth",
        });
      }
    }
  };

  const handleSubmit = () => {
    setIsSubmissionCompleted(true);
    // 提出完了後、少し待ってから次へ進む
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setCurrentDialogue(0);
      setIsAnimating(false);
      setIsSubmissionCompleted(false);
      setArtifactText("");
      setArtifactDescription("");
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
            {/* 閉じるボタンとミッション切り替えボタン */}
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
              style={{ mixBlendMode: "difference" }}
            >
              <X className="h-8 w-8" />
            </button>

            {/* コンテンツエリア - 背景画像の上にテキストとボタンdivを配置 */}
            <div
              ref={contentRef}
              className="relative flex-1 overflow-hidden"
              style={{
                ...(onboardingDialogues[currentDialogue]?.showMissionDetails
                  ? { overflowY: "auto" }
                  : {}),
              }}
            >
              {/* 背景画像 */}
              <div className="relative w-full h-full">
                <Image
                  src={
                    onboardingDialogues[currentDialogue].isWelcome
                      ? "/img/onboarding/background-only.svg"
                      : "/img/onboarding/background.svg"
                  }
                  alt="オンボーディング背景"
                  fill
                  className="object-fill"
                />
              </div>

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
                <div className="absolute top-20 max-[375px]:top-8 min-[376px]:max-[639px]:top-24 sm:top-16 left-0 right-0 px-8">
                  <div
                    className={`transition-opacity duration-300 ease-in-out ${
                      isAnimating ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <p
                      className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed text-center font-medium px-4 py-2"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: wbrタグのサポートのため、サニタイズ済みHTMLを使用
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(
                          getDynamicOnboardingText(
                            onboardingDialogues[currentDialogue],
                          ),
                        ),
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

                  {/* "次へ"ボタン（キャラクター基準の下） - 詳細画面では非表示 */}
                  {!onboardingDialogues[currentDialogue]
                    ?.showMissionDetails && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 z-10 mt-8 sm:mt-10 md:mt-12">
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
                  )}

                  {/* スクロール矢印（詳細表示時のキャラクター下） */}
                  {onboardingDialogues[currentDialogue]?.showMissionDetails && (
                    <button
                      type="button"
                      onClick={handleScrollDown}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 cursor-pointer bg-transparent border-none"
                    >
                      <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 1.5,
                        }}
                        className="flex flex-col items-center text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <span className="text-xs mb-1">下にスクロール</span>
                        <ChevronDown className="h-5 w-5" />
                      </motion.div>
                    </button>
                  )}

                  {/* ミッション詳細表示（キャラクターの下） */}
                  {onboardingDialogues[currentDialogue]?.showMissionDetails && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-16 w-[90vw] max-w-3xl z-20 pb-32">
                      <Card data-mission-detail-card>
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            {mockMission.icon_url && (
                              <MissionIcon
                                src={mockMission.icon_url}
                                alt={mockMission.title}
                                size="lg"
                              />
                            )}
                            <div className="flex-1 space-y-2">
                              <CardTitle className="text-xl">
                                {mockMission.title}
                              </CardTitle>
                              <div className="flex flex-wrap gap-2">
                                <DifficultyBadge
                                  difficulty={mockMission.difficulty}
                                />
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div
                            className="text-muted-foreground leading-relaxed whitespace-pre-wrap mission-content"
                            ref={(el) => {
                              if (el && mockMission.content) {
                                el.innerHTML = mockMission.content;
                              }
                            }}
                          />

                          {/* 提出フォーム - ミッションタイプに応じて表示 */}
                          {mockMission.required_artifact_type === "TEXT" && (
                            <Card className="mt-6">
                              <CardHeader>
                                <CardTitle className="text-lg text-center">
                                  ミッション完了を記録しよう
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  ミッションを完了したら、達成を記録しましょう！
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  ※
                                  入力した内容は、外部に公開されることはありません。
                                </p>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                {/* テキスト入力フォーム */}
                                <div className="space-y-2">
                                  <Label htmlFor="artifactText">
                                    {mockArtifactLabel}
                                    <span className="text-red-500">
                                      {" "}
                                      (必須)
                                    </span>
                                  </Label>
                                  <Input
                                    name="artifactText"
                                    id="artifactText"
                                    value={artifactText}
                                    onChange={(e) =>
                                      setArtifactText(e.target.value)
                                    }
                                    placeholder={`${mockArtifactLabel}を入力してください`}
                                    disabled={false}
                                    required
                                  />
                                </div>

                                {/* 補足説明テキストエリア */}
                                <div className="space-y-2">
                                  <Label htmlFor="artifactDescription">
                                    補足説明 (任意)
                                  </Label>
                                  <Textarea
                                    name="artifactDescription"
                                    id="artifactDescription"
                                    value={artifactDescription}
                                    onChange={(e) =>
                                      setArtifactDescription(e.target.value)
                                    }
                                    placeholder="達成内容に関して補足説明があれば入力してください"
                                    rows={3}
                                    disabled={false}
                                  />
                                </div>

                                {/* 提出ボタン */}
                                <Button
                                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  onClick={handleSubmit}
                                  disabled={
                                    isSubmissionCompleted ||
                                    artifactText.trim() === ""
                                  }
                                >
                                  {isSubmissionCompleted
                                    ? "提出完了！"
                                    : "チャレンジする"}
                                </Button>
                              </CardContent>
                            </Card>
                          )}

                          {/* NONEタイプの場合 */}
                          {mockMission.required_artifact_type === "NONE" && (
                            <Card className="mt-6">
                              <CardHeader>
                                <CardTitle className="text-lg text-center">
                                  ミッションにチャレンジしよう
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  下のボタンをクリックすると、自動的にミッションが完了します！
                                </p>
                              </CardHeader>
                              <CardContent>
                                <Button
                                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg"
                                  onClick={() => handleSubmit()}
                                  disabled={isSubmissionCompleted}
                                >
                                  {isSubmissionCompleted
                                    ? "ミッション完了！"
                                    : "記録する"}
                                </Button>
                                {isSubmissionCompleted && (
                                  <div className="mt-4 text-center">
                                    <p className="text-green-600 font-medium">
                                      ミッション完了！
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
