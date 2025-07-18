"use client";

import { useCallback, useState } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFireworksPreset } from "tsparticles-preset-fireworks";

interface FireworksProps {
  onTrigger?: () => void;
}

export default function Fireworks({ onTrigger }: FireworksProps) {
  const [isActive, setIsActive] = useState(false);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFireworksPreset(engine);
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
      )}
    </button>
  );
}
