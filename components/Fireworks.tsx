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
      .order("rank", { ascending: false })
      .limit(100);

    if (error) throw error;

    return (data || []).map((user) => ({
      name: user.name || "Unknown",
    }));
  } catch (error) {
    console.error("Failed to fetch contributors:", error);
    return [{ name: "Alice" }, { name: "Ken" }, { name: "Devid" }];
  }
}

const EndCredits = ({ contributors }: { contributors: ContributorData[] }) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 15,
        color: "white",
        textAlign: "center",
        fontFamily: "serif",
        animation: "fadeInUp 2s ease-in-out",
      }}
    >
      <div
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "2rem",
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
        }}
      >
        Contributors
      </div>
      <div
        style={{
          fontSize: "1.5rem",
          lineHeight: "3rem",
          textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
        }}
      >
        {contributors.map((contributor, index) => (
          <div
            key={contributor.name}
            style={{
              marginBottom: "2rem",
              opacity: 0,
              animation: `fadeInAndScroll 2s ease-in-out ${index * 1.5 + 1}s forwards`,
              transform: "translateY(100px)",
            }}
          >
            {contributor.name}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInAndScroll {
          0% {
            opacity: 0;
            transform: translateY(100px);
          }
          20% {
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            opacity: 1;
            transform: translateY(-50px);
          }
          100% {
            opacity: 0;
            transform: translateY(-150px);
          }
        }
      `}</style>
    </div>
  );
};

export default function Fireworks({ onTrigger }: FireworksProps) {
  const [isActive, setIsActive] = useState(false);
  const [contributors, setContributors] = useState<ContributorData[]>([]);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFireworksPreset(engine);
  }, []);

  useEffect(() => {
    const loadContributors = async () => {
      const contributorData = await fetchContributors();
      setContributors(contributorData);
    };
    loadContributors();
  }, []);

  const handleClick = useCallback(() => {
    setIsActive(true);
    onTrigger?.();
    setTimeout(() => setIsActive(false), 15000);
  }, [onTrigger]);

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
          <EndCredits contributors={contributors} />
        </>
      )}
    </button>
  );
}
