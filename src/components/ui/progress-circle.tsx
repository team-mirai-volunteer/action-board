"use client";

import type React from "react";
import { useEffect, useState } from "react";

interface ProgressCircleProps {
  /** 現在の値 */
  current: number;
  /** 最大値 */
  max: number;
  /** 円グラフのサイズ（直径） */
  size?: number;
  /** ストロークの太さ */
  strokeWidth?: number;
  /** 進捗バーの色 */
  progressColor?: string;
  /** 背景円の色 */
  backgroundColor?: string;
  /** 中央に表示するテキスト */
  centerText?: React.ReactNode;
  /** 中央テキストのスタイル */
  centerTextClassName?: string;
  /** アニメーション遅延時間（ms） */
  animationDelay?: number;
}

export function ProgressCircle({
  current,
  max,
  size = 160,
  strokeWidth = 8,
  progressColor = "#30BAA7",
  backgroundColor = "#E2F6F3",
  centerText,
  centerTextClassName = "",
  animationDelay = 300,
}: ProgressCircleProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetProgress = Math.min(Math.max(current / max, 0), 1);
  const strokeDashoffset = circumference - animatedProgress * circumference;

  useEffect(() => {
    // コンポーネントがマウントされた後、少し遅延してアニメーションを開始
    const timer = setTimeout(() => {
      setIsVisible(true);
      setAnimatedProgress(targetProgress);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [targetProgress, animationDelay]);

  // propsが変更された場合のアニメーション
  useEffect(() => {
    if (isVisible) {
      setAnimatedProgress(targetProgress);
    }
  }, [targetProgress, isVisible]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <title>Progress Circle</title>
        {/* 背景の円 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* 進捗の円 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="butt"
          className="transition-all duration-1000 ease-out"
          style={{
            transitionProperty: "stroke-dashoffset",
          }}
        />
      </svg>

      {/* 中央のテキスト */}
      {centerText && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center ${centerTextClassName}`}
        >
          {centerText}
        </div>
      )}
    </div>
  );
}
