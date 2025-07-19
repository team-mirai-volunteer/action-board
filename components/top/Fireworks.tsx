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
            onClick: { enable: true, mode: "emitter" },
          },
        },
        background: { color: { value: "transparent" } },
        particles: {
          number: {
            value: 0,
          },
        },
        emitters: {
          direction: "top",
          life: {
            count: 0,
            duration: 0.1,
            delay: 0,
          },
          rate: {
            delay: 0.1,
            quantity: 1,
          },
          size: {
            width: 0,
            height: 0,
          },
        },
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
