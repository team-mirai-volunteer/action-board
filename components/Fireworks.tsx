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
  scrollSpeedPxPerSec: number;
  onEnd: () => void;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [totalHeight, setTotalHeight] = useState(0);
  const [ready, setReady] = useState(false);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  const ITEM_HEIGHT = 80;
  const BUFFER_SIZE = 10;

  const rows = contributors.reduce<ContributorData[][]>((acc, c, i) => {
    if (i % 3 === 0) acc.push([]);
    acc[acc.length - 1].push(c);
    return acc;
  }, []);

  const visibleRows = rows.slice(
    Math.max(0, visibleRange.start - BUFFER_SIZE),
    Math.min(rows.length, visibleRange.end + BUFFER_SIZE),
  );

  useEffect(() => {
    if (wrapperRef.current && contributors.length > 0) {
      const estimatedHeight = rows.length * ITEM_HEIGHT + 1000;
      setTotalHeight(estimatedHeight);
      setReady(true);
    }
  }, [contributors, rows.length]);

  const durationMs = ready ? (totalHeight / scrollSpeedPxPerSec) * 1000 : 0;

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
        willChange: "transform",
      }}
    >
      <div
        ref={wrapperRef}
        style={{
          width: "100%",
          paddingTop: "20vh",
          paddingBottom: "20vh",
          animation: ready
            ? `scrollUp ${durationMs}ms linear forwards`
            : "none",
          transform: "translate3d(0, 100vh, 0)",
          willChange: "transform",
        }}
        onAnimationEnd={onEnd}
      >
        <div
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "3rem",
            textShadow: "2px 2px 4px rgba(0,0,0,.8)",
          }}
        >
          Contributors
        </div>

        <div
          style={{
            height: `${rows.length * ITEM_HEIGHT}px`,
            position: "relative",
          }}
        >
          <div
            style={{
              transform: `translateY(${Math.max(0, visibleRange.start - BUFFER_SIZE) * ITEM_HEIGHT}px)`,
              willChange: "transform",
            }}
          >
            {visibleRows.map((row, idx) => {
              const actualIdx =
                Math.max(0, visibleRange.start - BUFFER_SIZE) + idx;
              return (
                <div
                  key={actualIdx}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "3rem",
                    height: `${ITEM_HEIGHT}px`,
                    alignItems: "center",
                    textShadow: "1px 1px 2px rgba(0,0,0,.8)",
                    fontSize: "1.2rem",
                  }}
                >
                  {row.map((c) => (
                    <span key={c.name}>{c.name}</span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollUp {
          0% { transform: translate3d(0, 100vh, 0); }
          100% { transform: translate3d(0, -${totalHeight}px, 0); }
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

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(`Contributors loaded: ${contributors.length}`);
    }
  }, [contributors.length]);

  const SCROLL_SPEED = 50;

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFireworksPreset(engine);
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await fetchAllContributors();
        if (isMounted) {
          setContributors(data);
        }
      } catch (error) {
        console.error("Failed to fetch contributors:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleClick = useCallback(() => {
    if (showSpecialThanks) {
      // リセット
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
  }, [onTrigger, showSpecialThanks]);

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
              fpsLimit: 60,
              particles: {
                number: {
                  value: 50,
                  density: { enable: true, value_area: 800 },
                },
                life: { duration: { min: 1, max: 3 } },
                size: { value: { min: 1, max: 3 } },
                opacity: { value: { min: 0.3, max: 0.8 } },
              },
              emitters: {
                life: { count: 0 },
                rate: { quantity: 3, delay: 0.8 },
                size: { width: 100, height: 100 },
                position: { x: 50, y: 100 },
                direction: "top",
              },
              background: { color: { value: "transparent" } },
              detectRetina: false,
              reduceDuplicates: true,
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              willChange: "transform, opacity",
              transform: "translate3d(0, 0, 0)",
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
                  fontSize: "3rem",
                  fontWeight: "bold",
                  textShadow: "3px 3px 6px rgba(0,0,0,.8)",
                  animation: "fadeIn 2s ease-in-out",
                }}
              >
                Special Thanks to All Our Supporters
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
