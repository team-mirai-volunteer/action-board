"use client";

import { motion } from "framer-motion";
import type React from "react";
import { useCallback, useState } from "react";

interface FireworkParticle {
  id: number;
  x: number;
  y: number;
  color: string;
}

export default function Fireworks() {
  const [particles, setParticles] = useState<FireworkParticle[]>([]);

  const createFirework = useCallback((x: number, y: number) => {
    const colors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#f9ca24",
      "#f0932b",
      "#eb4d4b",
      "#6c5ce7",
    ];
    const newParticles: FireworkParticle[] = [];

    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.some((np) => np.id === p.id)),
      );
    }, 1000);
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      createFirework(x, y);
    },
    [createFirework],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const rect = event.currentTarget.getBoundingClientRect();
        const x = rect.width / 2;
        const y = rect.height / 2;
        createFirework(x, y);
      }
    },
    [createFirework],
  );

  return (
    <div
      className="absolute inset-0 w-full h-full cursor-pointer"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="クリックして花火を表示"
      style={{ zIndex: 10 }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: particle.color,
            left: particle.x,
            top: particle.y,
          }}
          initial={{
            scale: 0,
            x: 0,
            y: 0,
            opacity: 1,
          }}
          animate={{
            scale: [0, 1, 0],
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
