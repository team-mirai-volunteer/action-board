"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFireworksPreset } from "tsparticles-preset-fireworks";

interface FireworksProps {
  onTrigger?: () => void;
}
interface ContributorData {
  name: string;
}

async function fetchAllContributors(): Promise<ContributorData[]> {
  const supabase = createClient();
  const pageSize = 1000;
  let from = 0;
  let all: ContributorData[] = [];
  while (true) {
    const { data, error } = await supabase
      .from("user_ranking_view")
      .select("name")
      .order("rank", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all = all.concat(data.map((u) => ({ name: u.name || "Unknown" })));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

const EndCredits = ({
  contributors,
  scrollSpeedPxPerSec,
  onEnd,
}: {
  contributors: ContributorData[];
  scrollSpeedPxPerSec: number; // 固定速度(px/s)
  onEnd: () => void;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [totalHeight, setTotalHeight] = useState(0); // スクロールすべき総距離
  const [ready, setReady] = useState(false);

  // contributors が確定→DOM描画→高さ測定
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (wrapperRef.current) {
      // scrollHeight: padding + 内容全体
      const h = wrapperRef.current.scrollHeight;
      setTotalHeight(h);
      setReady(true);
    }
  }, [contributors]);

  // アニメーション時間(ms) = 距離(px) / 速度(px/s) * 1000
  const durationMs = ready ? (totalHeight / scrollSpeedPxPerSec) * 1000 : 0;

  // 3列に整形
  const rows = contributors.reduce<ContributorData[][]>((acc, c, i) => {
    if (i % 3 === 0) acc.push([]);
    acc[acc.length - 1].push(c);
    return acc;
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        color: "#fff",
        fontFamily: "serif",
        zIndex: 15,
      }}
    >
      <div
        ref={wrapperRef}
        style={{
          width: "100%",
          paddingTop: "20vh",
          paddingBottom: "20vh",
          paddingLeft: "24px",
          paddingRight: "24px",
          // totalHeight を測った後でアニメーションを付与
          animation: ready
            ? `scrollUp ${durationMs}ms linear forwards`
            : "none",
          transform: "translateY(100vh)",
        }}
        onAnimationEnd={onEnd}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "3rem",
            gap: "3rem", // ← 画像とテキストの間にスペース
          }}
        >
          <img
            src="/img/logo.png"
            alt="チームロゴ"
            style={{ width: "120px", height: "auto" }}
          />
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,.8)",
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            アクションボードチーム
          </div>
        </div>
        <div style={{ fontSize: "16px", lineHeight: "1.6" }}>
          {rows.map((row, idx) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={idx}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
                marginBottom: "2rem",
                textShadow: "1px 1px 2px rgba(0,0,0,.8)",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              {row.map((c) => (
                <span key={c.name}>{c.name}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollUp {
          0% { transform: translateY(100vh); }
          100% { transform: translateY(-${totalHeight}px); }
        }
      `}</style>
    </div>
  );
};

export default function Fireworks({ onTrigger }: FireworksProps) {
  const [isActive, setIsActive] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showSpecialThanks, setShowSpecialThanks] = useState(false);
  const [contributors, setContributors] = useState<ContributorData[]>([]);

  // ★ 固定スクロール速度(px/s) をここで決める
  const SCROLL_SPEED = 80; // 例: 80px/秒

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFireworksPreset(engine);
  }, []);

  useEffect(() => {
    if (isActive) return;

    const timer = setTimeout(() => {
      setIsActive(true);
      onTrigger?.();

      setTimeout(() => {
        setShowCredits(true);
      }, 3000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isActive, onTrigger]);

  useEffect(() => {
    (async () => {
      const data = await fetchAllContributors();
      setContributors(data);
    })();
  }, []);

  const handleClick = useCallback(() => {
    // すでにアニメーション中なら何もしない
    if (isActive && !showSpecialThanks) return;

    if (showSpecialThanks) {
      // リセット時のみ有効
      setIsActive(false);
      setShowCredits(false);
      setShowSpecialThanks(false);
      return;
    }

    setIsActive(true);
    setShowCredits(false);
    setShowSpecialThanks(false);
    onTrigger?.();
    setTimeout(() => setShowCredits(true), 3000);
  }, [isActive, showSpecialThanks, onTrigger]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    // biome-ignore lint/a11y/useButtonType: <explanation>
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={
        showSpecialThanks ? "エンドクレジットを閉じる" : "花火を打ち上げる"
      }
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 10,
        cursor: "pointer",
        border: "none",
        background: "transparent",
        padding: 0,
      }}
    >
      {isActive && (
        <>
          <Particles
            id="tsparticles-fireworks"
            init={particlesInit}
            options={{
              preset: "fireworks",
              fullScreen: { enable: false },
              emitters: {
                life: { count: 0 },
                rate: { quantity: 6, delay: { min: 0.5, max: 1.3 } },
                size: { width: 150, height: 150 },
                position: { x: 50, y: 100 },
                direction: "top",
              },
              particles: { life: { duration: { min: 1, max: 3 } } },
              background: { color: { value: "transparent" } },
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />
          {showCredits && (
            <EndCredits
              contributors={contributors}
              scrollSpeedPxPerSec={SCROLL_SPEED}
              onEnd={() => {
                setShowCredits(false);
                setShowSpecialThanks(true);
              }}
            />
          )}
          {showSpecialThanks && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "none",
                zIndex: 15,
                color: "white",
                textAlign: "center",
                fontFamily: "serif",
              }}
            >
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "bold",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  textShadow: "3px 3px 6px rgba(0,0,0,.8)",
                  animation: "fadeIn 2s ease-in-out",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4rem", // テキストと画像の間隔
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}
              >
                ご支援をいただき、 誠にありがとうございました
                <img
                  src="/img/logo.png"
                  alt="チームロゴ"
                  style={{ width: "120px", height: "auto" }}
                />
              </div>

              <style jsx>{`
                @keyframes fadeIn {
                  0% { opacity: 0; transform: scale(0.8); }
                  100% { opacity: 1; transform: scale(1); }
                }
              `}</style>
            </div>
          )}
        </>
      )}
    </button>
  );
}
