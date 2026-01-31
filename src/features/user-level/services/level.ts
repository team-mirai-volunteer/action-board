import { getUser } from "@/features/user-profile/services/profile";
import { getCurrentSeasonId } from "@/lib/services/seasons";
import { createAdminClient } from "@/lib/supabase/adminClient";
import {
  executeChunkedInsert,
  executeChunkedQuery,
} from "@/lib/utils/supabase-utils";
import type {
  BatchXpResult,
  BatchXpTransaction,
  UserLevel,
  XpGrantResult,
  XpSourceType,
  XpTransaction,
} from "../types/level-types";
import { calculateLevel, calculateMissionXp } from "../utils/level-calculator";

/**
 * ユーザーのレベル情報を取得する（現在のアクティブシーズン）
 */
export async function getMyUserLevel(): Promise<UserLevel | null> {
  const user = await getUser();
  if (!user) {
    console.error("User not found");
    return null;
  }

  const seasonId = await getCurrentSeasonId();
  if (!seasonId) {
    console.error("Current season not found");
    return null;
  }

  const supabase = await createAdminClient();

  const { data } = await supabase
    .from("user_levels")
    .select("*")
    .eq("user_id", user.id)
    .eq("season_id", seasonId)
    .maybeSingle();

  return data;
}

/**
 * ユーザーのレベル情報を取得する（現在のアクティブシーズン）
 */
export async function getUserLevel(
  userId: string,
  seasonId?: string,
): Promise<UserLevel | null> {
  let targetSeasonId = seasonId ?? null;

  if (!targetSeasonId) {
    targetSeasonId = await getCurrentSeasonId();
    if (!targetSeasonId) {
      console.error("Current season not found");
      return null;
    }
  }

  const supabase = await createAdminClient();

  const { data } = await supabase
    .from("user_levels")
    .select("*")
    .eq("user_id", userId)
    .eq("season_id", targetSeasonId)
    .single();

  return data;
}

/**
 * ユーザーのレベル情報を初期化する（新規ユーザー用）
 */
export async function initializeUserLevel(
  userId: string,
): Promise<UserLevel | null> {
  const seasonId = await getCurrentSeasonId();
  if (!seasonId) {
    console.error("Current season not found");
    return null;
  }

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("user_levels")
    .insert({
      user_id: userId,
      season_id: seasonId,
      xp: 0,
      level: 1,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to initialize user level:", error);
    return null;
  }

  return data;
}

/**
 * ユーザーのレベル情報を取得、存在しない場合は初期化
 */
export async function getOrInitializeUserLevel(
  userId: string,
): Promise<UserLevel | null> {
  let userLevel = await getUserLevel(userId);

  if (!userLevel) {
    userLevel = await initializeUserLevel(userId);
  }

  return userLevel;
}

/**
 * XPトランザクションの記録とユーザーレベルの更新を行う共通処理
 */
async function processXpTransaction(
  userId: string,
  xpAmount: number,
  sourceType: XpSourceType,
  sourceId?: string,
  description?: string,
): Promise<XpGrantResult> {
  const seasonId = await getCurrentSeasonId();
  if (!seasonId) {
    return { success: false, error: "Current season not found" };
  }

  const supabase = await createAdminClient();

  try {
    // XPトランザクションを記録
    const { error: transactionError } = await supabase
      .from("xp_transactions")
      .insert({
        user_id: userId,
        season_id: seasonId,
        xp_amount: xpAmount,
        source_type: sourceType,
        source_id: sourceId,
        description: description || `${sourceType}による経験値調整`,
      });

    if (transactionError) {
      console.error("Failed to create XP transaction:", transactionError);
      return { success: false, error: transactionError.message };
    }

    // ユーザーレベル情報を取得・初期化
    const currentLevel = await getOrInitializeUserLevel(userId);
    if (!currentLevel) {
      return {
        success: false,
        error: "ユーザーレベル情報の取得に失敗しました",
      };
    }

    // 新しいXPとレベルを計算
    const newXp = currentLevel.xp + xpAmount;
    const newLevel = calculateLevel(newXp);

    // ユーザーレベルを更新
    const { data: updatedLevel, error: updateError } = await supabase
      .from("user_levels")
      .update({
        xp: newXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("season_id", seasonId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update user level:", updateError);
      return { success: false, error: "ユーザーレベルの更新に失敗しました" };
    }

    return { success: true, userLevel: updatedLevel };
  } catch (error) {
    console.error("Error in processXpTransaction:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

/**
 * 手動でXPを付与する（ボーナスや調整用）
 */
export async function grantXp(
  userId: string,
  xpAmount: number,
  sourceType: XpSourceType = "BONUS",
  sourceId?: string,
  description?: string,
): Promise<XpGrantResult> {
  return processXpTransaction(
    userId,
    xpAmount,
    sourceType,
    sourceId,
    description,
  );
}

/**
 * ユーザーのXP履歴を取得する
 */
export async function getUserXpHistory(
  userId: string,
  limit = 50,
): Promise<XpTransaction[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("xp_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch XP history:", error);
    return [];
  }

  return data || [];
}

/**
 * ユーザーのBONUSXPを取得する
 */
export async function getUserXpBonus(
  userId: string,
  achievementId: string,
): Promise<number> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("xp_transactions")
    .select("xp_amount")
    .eq("user_id", userId)
    .eq("source_id", achievementId)
    .eq("source_type", "BONUS")
    .single();

  if (error) {
    console.error("Failed to fetch BONUS XP:", error);
    return 0;
  }

  return data.xp_amount || 0;
}

/**
 * 特定ユーザーのランクを取得する
 */
export async function getUserRank(userId: string): Promise<number | null> {
  const supabase = await createAdminClient();

  // より高いXPを持つユーザーの数を数える
  const { data: userLevel } = await supabase
    .from("user_levels")
    .select("xp")
    .eq("user_id", userId)
    .single();

  if (!userLevel) return null;

  const { count, error } = await supabase
    .from("user_levels")
    .select("*", { count: "exact", head: true })
    .gt("xp", userLevel.xp);

  if (error) {
    console.error("Failed to calculate user rank:", error);
    return null;
  }

  return (count || 0) + 1; // より高いユーザー数 + 1 = 自分のランク
}

/**
 * ミッション達成時にXPを付与する
 */
export async function grantMissionCompletionXp(
  userId: string,
  missionId: string,
  achievementId: string,
): Promise<XpGrantResult> {
  const supabase = await createAdminClient();

  try {
    // ミッション情報を取得して難易度と注目ミッションフラグを確認
    const { data: mission, error: missionError } = await supabase
      .from("missions")
      .select("difficulty, title, is_featured")
      .eq("id", missionId)
      .single();

    if (missionError) {
      console.error("Failed to fetch mission:", missionError);
      return { success: false, error: "ミッション情報の取得に失敗しました" };
    }

    // 難易度に基づくXP計算（注目ミッションは2倍）
    const xpToGrant = calculateMissionXp(
      mission.difficulty,
      mission.is_featured,
    );
    const description = `ミッション「${mission.title}」達成による経験値獲得`;

    // 共通のXP処理を実行
    const result = await processXpTransaction(
      userId,
      xpToGrant,
      "MISSION_COMPLETION",
      achievementId,
      description,
    );

    if (result.success) {
      return {
        success: true,
        userLevel: result.userLevel,
        xpGranted: xpToGrant,
      };
    }
    return result;
  } catch (error) {
    console.error("Error in grantMissionCompletionXp:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

/**
 * バッチ処理用：複数のユーザーに一括でXPを付与する
 * N+1問題を回避し、パフォーマンスを最適化
 */
export async function grantXpBatch(
  transactions: BatchXpTransaction[],
): Promise<BatchXpResult> {
  const supabase = await createAdminClient();

  if (!transactions || transactions.length === 0) {
    return { success: true, results: [] };
  }

  // 現在のシーズンIDを取得
  const seasonId = await getCurrentSeasonId();
  if (!seasonId) {
    return { success: false, error: "Current season not found", results: [] };
  }

  try {
    // 1. 全てのユーザーIDを収集（重複排除）
    const userIdSet = new Set<string>();
    for (const transaction of transactions) {
      userIdSet.add(transaction.userId);
    }
    const userIds = Array.from(userIdSet);

    // 2. 現在のユーザーレベル情報を一括取得（チャンク分割）
    const { data: currentLevels, error: levelsError } =
      await executeChunkedQuery<UserLevel>(
        userIds,
        async (chunkIds) => {
          return await supabase
            .from("user_levels")
            .select("*")
            .in("user_id", chunkIds)
            .eq("season_id", seasonId);
        },
        50,
      );

    if (levelsError) {
      console.error("Failed to fetch user levels:", levelsError);
      return { success: false, error: levelsError.message, results: [] };
    }

    // 3. 現在のレベル情報をMapに変換（高速検索のため）
    const levelMap = new Map(
      currentLevels?.map((level) => [level.user_id, level]) || [],
    );

    // 4. 存在しないユーザーのレベル情報を初期化
    const missingUserIds = userIds.filter((userId) => !levelMap.has(userId));

    if (missingUserIds.length > 0) {
      const { data: initializedLevels, error: initError } =
        await executeChunkedInsert(
          missingUserIds.map((userId) => ({
            user_id: userId,
            season_id: seasonId,
            xp: 0,
            level: 1,
          })),
          async (chunk) => {
            return await supabase.from("user_levels").insert(chunk).select();
          },
          50,
        );

      if (initError) {
        console.error("Failed to initialize user levels:", initError);
        return { success: false, error: initError.message, results: [] };
      }

      // 初期化されたレベルをMapに追加
      for (const level of initializedLevels || []) {
        levelMap.set(level.user_id, level);
      }
    }

    // 5. XPトランザクションを一括挿入
    const xpTransactions = transactions.map((transaction) => ({
      user_id: transaction.userId,
      xp_amount: transaction.xpAmount,
      source_type: transaction.sourceType,
      source_id: transaction.sourceId,
      description:
        transaction.description || `${transaction.sourceType}による経験値獲得`,
    }));

    const { error: transactionError } = await executeChunkedInsert(
      xpTransactions,
      async (chunk) => {
        return await supabase.from("xp_transactions").insert(chunk);
      },
      50,
    );

    if (transactionError) {
      console.error("Failed to insert XP transactions:", transactionError);
      return { success: false, error: transactionError.message, results: [] };
    }

    // 6. ユーザーごとのXP合計を計算
    const userXpUpdates = new Map<string, number>();

    for (const transaction of transactions) {
      const currentTotal = userXpUpdates.get(transaction.userId) || 0;
      userXpUpdates.set(
        transaction.userId,
        currentTotal + transaction.xpAmount,
      );
    }

    // 7. ユーザーレベルを一括更新
    const levelUpdates: Array<{
      user_id: string;
      season_id: string;
      xp: number;
      level: number;
      updated_at: string;
    }> = [];

    const results: Array<{
      userId: string;
      success: boolean;
      error?: string;
      newXp?: number;
      newLevel?: number;
    }> = [];

    for (const [userId, xpChange] of Array.from(userXpUpdates.entries())) {
      const currentLevel = levelMap.get(userId);
      if (!currentLevel) {
        results.push({
          userId,
          success: false,
          error: "ユーザーレベル情報が見つかりません",
        });
        continue;
      }

      const newXp = currentLevel.xp + xpChange;
      const newLevel = calculateLevel(newXp);

      levelUpdates.push({
        user_id: userId,
        season_id: seasonId,
        xp: newXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      });

      results.push({
        userId,
        success: true,
        newXp,
        newLevel,
      });
    }

    // 8. レベル情報を一括更新（upsert）
    if (levelUpdates.length > 0) {
      const { error: updateError } = await supabase
        .from("user_levels")
        .upsert(levelUpdates, {
          onConflict: "user_id,season_id",
        });

      if (updateError) {
        console.error("Failed to update user levels:", updateError);
        return { success: false, error: updateError.message, results: [] };
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error("Error in grantXpBatch:", error);
    const errorMessage =
      error instanceof Error ? error.message : "予期しないエラーが発生しました";
    return { success: false, error: errorMessage, results: [] };
  }
}
