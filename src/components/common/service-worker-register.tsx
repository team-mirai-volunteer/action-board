"use client";

import { useEffect } from "react";

/**
 * Service Workerを登録し、Web Push通知のサブスクリプションを管理するコンポーネント。
 *
 * Declarative Web Push（iOS Safari 18.4+）はmanifestを通じてブラウザが自動処理するが、
 * Chrome/Android向けにService WorkerベースのWeb Pushフォールバックを提供する。
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("Service Worker registration failed:", err));
  }, []);

  return null;
}
