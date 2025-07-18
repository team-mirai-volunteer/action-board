import React from "react";

const COLORS = [
  "#FF6B6B",
  "#F8E71C",
  "#50E3C2",
  "#417505",
  "#9013FE",
  "#4A90E2",
] as const;

export default function Confetti() {
  // 1 回だけ 50 個の紙吹雪を作る
  const items = React.useMemo(
    () =>
      Array.from({ length: 80 }).map(() => {
        const size = Math.random() * 8 + 2; // 4–12 px
        const left = Math.random() * 100; // 横位置 %
        const delay = Math.random() * 5; // 開始ディレイ s
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const id = `${left.toFixed(2)}_${delay.toFixed(2)}_${size.toFixed(2)}`;
        return { id, size, left, delay, color };
      }),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map(({ id, size, left, delay, color }) => (
        <span
          key={id}
          className="block absolute animate-confetti-fall"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            left: `${left}%`,
            top: "-10%",
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}
