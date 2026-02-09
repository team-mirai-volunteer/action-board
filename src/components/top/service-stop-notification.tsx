/**
 * サービス停止通知コンポーネント
 *
 * メンテナンスモード中に表示される停止画面。
 * 背景画像を表示し、エンドロール開始時にフェードアウトする。
 */

"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

const MaintenanceWinterEffect = dynamic(
  () => import("@/components/top/maintenance-winter-effect"),
  {
    ssr: false,
  },
);

const BACKGROUND_HIDE_DELAY_MS = 8000;

export default function ServiceStopNotification() {
  const [hideBackground, setHideBackground] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHideBackground(true);
    }, BACKGROUND_HIDE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A1A] overflow-hidden">
      <div
        className="relative h-full w-full"
        style={{
          opacity: hideBackground ? 0 : 1,
          transition: "opacity 1.5s ease-out",
        }}
      >
        <Image
          src="/img/close_image_a1.png"
          alt="サービス停止"
          fill
          className="object-contain"
          priority
        />
      </div>

      <MaintenanceWinterEffect />
    </div>
  );
}
