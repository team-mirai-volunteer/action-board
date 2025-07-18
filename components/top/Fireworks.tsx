"use client";

import { useCallback } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFireworksPreset } from "tsparticles-preset-fireworks";

export default function Fireworks() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFireworksPreset(engine);
  }, []);

  return (
    <Particles
      id="tsparticles-fireworks"
      init={particlesInit}
      options={{
        preset: "fireworks",
        fullScreen: { enable: false },
        interactivity: {
          events: {
            onClick: { enable: true, mode: "push" },
          },
        },
        background: { color: { value: "transparent" } },
        particles: {
          number: {
            value: 0,
          },
        },
        emitters: [],
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
        zIndex: 10,
      }}
    />
  );
}
