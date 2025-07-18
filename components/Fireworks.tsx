"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFireworksPreset } from "tsparticles-preset-fireworks";

interface FireworksProps {
  onTrigger?: () => void;
}

interface ContributorData {
  name: string;
}

async function fetchContributors(): Promise<ContributorData[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_ranking_view")
      .select("name")
      .order("rank", { ascending: false });

    if (error) throw error;

    return (data || []).map((user) => ({
      name: user.name || "Unknown",
    }));
  } catch (error) {
    console.error("Failed to fetch contributors:", error);
    return [{ name: "Alice" }, { name: "Ken" }, { name: "Devid" }];
  }
}

const EndCredits = ({
  contributors,
  duration,
  onEnd,
}: {
  contributors: ContributorData[];
  duration: number;
  onEnd: () => void;
}) => {
  const contributorRows = [];
  for (let i = 0; i < contributors.length; i += 3) {
    contributorRows.push(contributors.slice(i, i + 3));
  }

  const rowCount = contributorRows.length;
  const timePerRow = 1000;
  const creditsAnimationDuration = rowCount * timePerRow + 3000;
  const rowHeight = 2.5 * 16 + 32; // 2.5rem + marginBottom(2rem=32px)
  const totalHeight = rowCount * rowHeight + 300; // 少し余白を追加

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 15,
        color: "white",
        textAlign: "center",
        fontFamily: "serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          paddingTop: "20vh",
          paddingBottom: "20vh",
          animation: `scrollUp ${creditsAnimationDuration}ms linear`,
          // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
          transform: `translateY(100vh)`,
          animationFillMode: "forwards",
        }}
        onAnimationEnd={onEnd}
      >
        <div
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "3rem",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          Contributors
        </div>
        <div
          style={{
            fontSize: "1.2rem",
            lineHeight: "2.5rem",
            textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          {contributorRows.map((row) => (
            <div
              key={row.map((c) => c.name).join("-")}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "3rem",
                marginBottom: "2rem",
              }}
            >
              {row.map((contributor) => (
                <span key={contributor.name}>{contributor.name}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 動的 @keyframes スタイル */}
      <style jsx>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(100vh);
          }
          100% {
            transform: translateY(-${totalHeight}px);
          }
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
  const [duration, setDuration] = useState(15000);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFireworksPreset(engine);
  }, []);

  useEffect(() => {
    const loadContributors = async () => {
      const contributorData = await fetchContributors();
      setContributors(contributorData);

      const calculatedDuration = Math.max(
        15000,
        (contributorData.length / 6) * 1000 + 3000,
      );
      setDuration(calculatedDuration);
    };
    loadContributors();
  }, []);

  const handleClick = useCallback(() => {
    if (showSpecialThanks) {
      setIsActive(false);
      setShowCredits(false);
      setShowSpecialThanks(false);
      return;
    }

    setIsActive(true);
    setShowCredits(false);
    setShowSpecialThanks(false);
    onTrigger?.();

    setTimeout(() => {
      setShowCredits(true);
    }, 3000);
  }, [onTrigger, showSpecialThanks]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    <button
      type="button"
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
                rate: { quantity: 6, delay: 0.5 },
                size: { width: 150, height: 150 },
                position: { x: 50, y: 100 },
                direction: "top",
              },
              particles: {
                life: { duration: { min: 1, max: 3 } },
              },
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
              duration={duration}
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
                  fontSize: "3rem",
                  fontWeight: "bold",
                  textShadow: "3px 3px 6px rgba(0,0,0,0.8)",
                  animation: "fadeIn 2s ease-in-out",
                }}
              >
                Special Thanks to All Our Supporters
              </div>
              <style jsx>{`
                @keyframes fadeIn {
                  0% {
                    opacity: 0;
                    transform: scale(0.8);
                  }
                  100% {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
              `}</style>
            </div>
          )}
        </>
      )}
    </button>
  );
}
