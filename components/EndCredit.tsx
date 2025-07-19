"use client";

import type { UserRanking } from "@/lib/services/ranking";
import { useEffect, useState } from "react";

interface EndCreditProps {
  onAnimationEnd?: () => void;
}

export default function EndCredit({ onAnimationEnd }: EndCreditProps) {
  const [users, setUsers] = useState<UserRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/endcredit-users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const userData = await response.json();
        setUsers(userData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "データの取得に失敗しました",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!isLoading && users.length > 0) {
      const timer = setTimeout(() => {
        onAnimationEnd?.();
      }, 60000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, users.length, onAnimationEnd]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-xl text-red-400">エラー: {error}</div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      style={{ pointerEvents: "none" }}
    >
      <div className="animate-scroll-up text-white text-center py-8">
        <div className="mb-16">
          <h1 className="text-4xl font-bold mb-8">Special Thanks</h1>
          <h2 className="text-2xl mb-16">
            全てのアクションボードユーザーの皆様
          </h2>
        </div>

        <div className="space-y-4 px-8">
          {users.map((user, index) => (
            <div key={user.user_id || index} className="text-lg">
              <div className="font-medium">{user.name || "匿名ユーザー"}</div>
              <div className="text-sm text-gray-400">
                {user.address_prefecture}
              </div>
              <div className="text-xs text-gray-500">
                Rank #{user.rank} - {user.xp?.toLocaleString()}pt
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 mb-32">
          <h2 className="text-3xl font-bold mb-4">ありがとうございました</h2>
          <p className="text-xl">チームみらい一同</p>
        </div>
      </div>
    </div>
  );
}
