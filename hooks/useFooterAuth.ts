import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

/**
 * フッターコンポーネント専用の認証状態管理フック
 * ソーシャルシェア機能で使用するユーザー情報を提供する
 */
export function useFooterAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true; // コンポーネントのマウント状態を追跡
    const supabase = createClient();

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Footer認証状態の取得に失敗:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "認証エラー");
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        console.log("Footer認証状態変更:", event, session?.user?.id);
        setUser(session?.user ?? null);
        setLoading(false);
        setError(null);
      }
    });

    return () => {
      mounted = false; // マウント状態をfalseに設定
      subscription.unsubscribe(); // 認証状態変更の監視を停止
    };
  }, []);

  return {
    user, // ユーザー情報
    loading, // 読み込み状態
    error, // エラー情報
    isAuthenticated: !!user, // 認証済みかどうかの真偽値
    refreshAuth: () => {
      setLoading(true); // 認証状態の再取得をトリガー
    },
  };
}
