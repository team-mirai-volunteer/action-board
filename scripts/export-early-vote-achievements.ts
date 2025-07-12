#!/usr/bin/env tsx

import { createWriteStream } from "node:fs";
import { join } from "node:path";
import { createServiceClient } from "@/lib/supabase/server";

interface EarlyVoteAchievementData {
  user_id: string;
  name: string;
  prefecture: string;
  achievement_date: string;
}

async function getMissionIdBySlug(slug: string): Promise<string | null> {
  const supabase = await createServiceClient();

  const { data: mission, error } = await supabase
    .from("missions")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("ミッション取得エラー:", error);
    return null;
  }

  return mission?.id || null;
}

async function getEarlyVoteAchievements(): Promise<EarlyVoteAchievementData[]> {
  const supabase = await createServiceClient();

  console.log("「期日前投票をしよう！」ミッションのIDを取得中...");
  const missionId = await getMissionIdBySlug("early-vote");

  if (!missionId) {
    console.error("「期日前投票をしよう！」ミッションが見つかりません");
    return [];
  }

  console.log(`ミッションID: ${missionId}`);
  console.log("達成データを取得中...");

  const { data: basicAchievements, error: basicError } = await supabase
    .from("achievements")
    .select("id, created_at, user_id")
    .eq("mission_id", missionId)
    .order("created_at", { ascending: true });

  if (basicError || !basicAchievements) {
    console.error("基本達成データ取得エラー:", basicError);
    return [];
  }

  if (basicAchievements.length === 0) {
    console.log("達成データが見つかりませんでした");
    return [];
  }

  console.log(`基本達成データ取得完了: ${basicAchievements.length} 件`);

  const achievementsWithUserData = await Promise.all(
    basicAchievements.map(async (achievement) => {
      if (!achievement.user_id) {
        console.warn(`user_idが空です (achievement_id: ${achievement.id})`);
        return {
          user_id: "",
          name: "",
          prefecture: "",
          achievement_date: achievement.created_at,
        };
      }

      const { data: userData, error: userError } = await supabase
        .from("public_user_profiles")
        .select("name, address_prefecture")
        .eq("id", achievement.user_id)
        .single();

      if (userError || !userData) {
        console.warn(
          `ユーザーデータ取得エラー (user_id: ${achievement.user_id}):`,
          userError,
        );
        return {
          user_id: achievement.user_id,
          name: "",
          prefecture: "",
          achievement_date: achievement.created_at,
        };
      }

      return {
        user_id: achievement.user_id,
        name: userData.name || "",
        prefecture: userData.address_prefecture || "",
        achievement_date: achievement.created_at,
      };
    }),
  );

  console.log(`達成データ取得完了: ${achievementsWithUserData.length} 件`);
  return achievementsWithUserData;
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportToCSV(achievements: EarlyVoteAchievementData[]): string {
  const outputPath = join(process.cwd(), "early-vote-achievements-export.csv");
  const writeStream = createWriteStream(outputPath);

  console.log("CSV出力開始...");

  const headers = ["user_id", "name", "prefecture", "achievement_date"];
  writeStream.write(`${headers.join(",")}\n`);

  for (const achievement of achievements) {
    const row = [
      escapeCSV(achievement.user_id),
      escapeCSV(achievement.name),
      escapeCSV(achievement.prefecture),
      escapeCSV(achievement.achievement_date),
    ];
    writeStream.write(`${row.join(",")}\n`);
  }

  writeStream.end();
  console.log(`CSV出力完了: ${outputPath}`);
  return outputPath;
}

async function main() {
  try {
    console.log("=== 期日前投票ミッション達成データエクスポート開始 ===");

    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`必要な環境変数が設定されていません: ${envVar}`);
        process.exit(1);
      }
    }

    const achievements = await getEarlyVoteAchievements();

    if (achievements.length === 0) {
      console.log("エクスポートするデータがありません");
      return;
    }

    const outputPath = exportToCSV(achievements);

    console.log("=== エクスポート完了 ===");
    console.log(`出力ファイル: ${outputPath}`);
    console.log(`処理件数: ${achievements.length} 件`);

    const prefectureStats = achievements.reduce(
      (acc, achievement) => {
        acc[achievement.prefecture] = (acc[achievement.prefecture] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("\n=== 都道府県別統計 ===");
    for (const [prefecture, count] of Object.entries(prefectureStats).sort(
      ([, a], [, b]) => b - a,
    )) {
      console.log(`${prefecture}: ${count} 件`);
    }

    if (achievements.length > 0) {
      const firstAchievement = achievements[0];
      const lastAchievement = achievements[achievements.length - 1];
      console.log("\n=== 期間統計 ===");
      console.log(`最初の達成: ${firstAchievement.achievement_date}`);
      console.log(`最後の達成: ${lastAchievement.achievement_date}`);
    }
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
