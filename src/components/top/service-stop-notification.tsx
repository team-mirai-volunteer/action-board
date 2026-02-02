/**
 * サービス停止通知コンポーネント
 *
 * このコンポーネントは投開票日当日のサービス停止時に使用されました。
 * アクションボードのサービスの一時停止措置として実装されています。
 *
 */

"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

const Fireworks = dynamic(() => import("@/components/top/fireworks"), {
  ssr: false,
});

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

      {/* tsParticles の fireworks - now clickable */}
      <Fireworks />
    </div>
  );
}
