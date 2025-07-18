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
}: { contributors: ContributorData[]; duration: number }) => {
  const contributorRows = [];
  for (let i = 0; i < contributors.length; i += 3) {
    contributorRows.push(contributors.slice(i, i + 3));
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
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
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "2rem",
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          animation: `scrollUp ${duration}ms linear`,
        }}
      >
        Contributors
      </div>
      <div
        style={{
          fontSize: "1.2rem",
          lineHeight: "2rem",
          textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
          animation: `scrollUp ${duration}ms linear`,
        }}
      >
        {contributorRows.map((row) => (
          <div
            key={row.map((c) => c.name).join("-")}
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "3rem",
              marginBottom: "1.5rem",
            }}
          >
            {row.map((contributor) => (
              <span key={contributor.name}>{contributor.name}</span>
            ))}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(100vh);
          }
          100% {
            transform: translateY(-100vh);
          }
        }
      `}</style>
    </div>
  );
};

export default function Fireworks({ onTrigger }: FireworksProps) {
  const [isActive, setIsActive] = useState(false);
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
    setIsActive(true);
    onTrigger?.();
    setTimeout(() => setIsActive(false), duration);
  }, [onTrigger, duration]);

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
      aria-label="花火を打ち上げる"
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
                rate: { quantity: 3, delay: 0.7 },
                size: { width: 100, height: 100 },
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
          <EndCredits contributors={contributors} duration={duration} />
        </>
      )}
    </button>
  );
}
