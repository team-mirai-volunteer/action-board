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
        fullScreen: { enable: false }, // 親要素にフィットさせる
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push", // or "fireworks" depending on tsparticles version
            },
          },
        },
        background: { color: { value: "transparent" } },
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto", // Changed from "none" to "auto" to enable clicks
        zIndex: 10, // Ensure it's above the image
      }}
    />
  );
}
