"use client";

import dynamic from "next/dynamic";
import React from "react";

const Fireworks = dynamic(() => import("./Fireworks"), {
  ssr: false,
});

export default function ServiceStopNotification() {
  return (
    <div className="fixed inset-0 z-50 bg-[#BCECD3] flex items-center justify-center overflow-hidden">
      <img
        src="/img/close_image_a1.png"
        alt="サービス停止"
        className="h-full w-auto object-contain"
      />

      {/* framer-motion の fireworks - now clickable */}
      <Fireworks />
    </div>
  );
}
