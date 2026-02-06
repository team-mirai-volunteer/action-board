/**
 * サービス停止通知コンポーネント
 *
 * メンテナンスモード中に表示される停止画面。
 */

"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

const MaintenanceWinterEffect = dynamic(
  () => import("@/components/top/maintenance-winter-effect"),
  {
    ssr: false,
  },
);

export default function ServiceStopNotification() {
  return (
    <div className="fixed inset-0 z-50 bg-[#BCECD3] flex items-center justify-center overflow-hidden">
      <div className="relative h-full w-full">
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
