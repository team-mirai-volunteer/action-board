/**
 * サービス停止通知コンポーネント
 *
 * メンテナンスモード中に表示される停止画面。
 */

"use client";

import dynamic from "next/dynamic";

const MaintenanceWinterEffect = dynamic(
  () => import("@/components/top/maintenance-winter-effect"),
  {
    ssr: false,
  },
);

export default function ServiceStopNotification() {
  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A1A] overflow-hidden">
      <MaintenanceWinterEffect />
    </div>
  );
}
