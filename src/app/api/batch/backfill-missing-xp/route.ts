import { grantXpBatch } from "@/lib/services/userLevel";
import { createServiceClient } from "@/lib/supabase/server";
import { executeChunkedQuery } from "@/lib/utils/supabase-utils";
import { calculateMissionXp } from "@/lib/utils/utils";
import { type NextRequest, NextResponse } from "next/server";

// 型定義を明示（Supabaseの!innerJOINが配列を返す可能性を考慮）
type AchievementWithMission = {
  id: string;
  user_id: string;
  mission_id: string;
  created_at: string;
  missions:
    | {
        id: string;
        title: string;
        difficulty: number;
      }
    | {
        id: string;
        title: string;
        difficulty: number;
      }[];
};

/**
 * ポイントが加算されていないミッション達成にポイントを付与するバッチ処理
 *
 * 本APIは管理者が実行する想定で、以下の処理を行います：
 * 1. XPトランザクションが記録されていないミッション達成を検索
 * 2. 各達成にミッション難易度に応じたXPを付与
 * 3. 処理結果をレポートとして返却
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServiceClient();

    // リクエストボディから認証情報を確認（簡易的な認証）
    const body = await request.json();
    const { adminKey } = body;

    // 環境変数で設定した管理者キーで認証
    if (adminKey !== process.env.BATCH_ADMIN_KEY) {
      return NextResponse.json(
        { error: "認証に失敗しました" },
        { status: 401 },
      );
    }

    console.log("=== XP付与バッチ処理を開始します ===");

    // XPが付与されていない達成を特定するため、すべての達成を取得し
    // それぞれにXPトランザクションが存在するかチェック
    const { data: allAchievements, error: allAchievementsError } =
      await supabase
        .from("achievements")
        .select(`
        id,
        user_id,
        mission_id,
        created_at,
        missions!inner(
          id,
          title,
          difficulty
        )
      `)
        .order("created_at", { ascending: true });

    if (allAchievementsError) {
      console.error(
        "全ミッション達成データの取得に失敗しました:",
        allAchievementsError,
      );
      return NextResponse.json(
        {
          error: "全ミッション達成データの取得に失敗しました",
          details: allAchievementsError.message,
        },
        { status: 500 },
      );
    }

    // 型安全のためのキャスト
    const typedAchievements = allAchievements as AchievementWithMission[];

    if (!typedAchievements || typedAchievements.length === 0) {
      return NextResponse.json({
        success: true,
        message: "処理対象のミッション達成が見つかりませんでした",
        processed: 0,
        skipped: 0,
        errors: 0,
      });
    }

    // XPが付与されていない達成をフィルタリング（IN句を使用してN+1クエリを回避）
    const achievementIds = typedAchievements.map(
      (achievement) => achievement.id,
    );

    // 全ての達成IDに対するXPトランザクションを一括取得（チャンク分割）
    const { data: existingXpTransactions, error: xpBulkCheckError } =
      await executeChunkedQuery(
        achievementIds,
        async (chunkIds) => {
          return await supabase
            .from("xp_transactions")
            .select("source_id")
            .eq("source_type", "MISSION_COMPLETION")
            .in("source_id", chunkIds);
        },
        50,
      );

    if (xpBulkCheckError) {
      console.error("XPトランザクションの一括取得でエラー:", xpBulkCheckError);
      return NextResponse.json(
        {
          error: "XPトランザクションの確認に失敗しました",
          details: xpBulkCheckError.message,
        },
        { status: 500 },
      );
    }

    // すでにXPが付与されている達成IDのSetを作成（高速な検索のため）
    const processedAchievementIds = new Set(
      existingXpTransactions?.map((tx) => tx.source_id) || [],
    );

    // XPが未付与の達成のみを抽出
    const missingXpAchievements = typedAchievements.filter(
      (achievement) => !processedAchievementIds.has(achievement.id),
    );

    console.log(
      `XP未付与の達成が ${missingXpAchievements.length} 件見つかりました`,
    );

    if (missingXpAchievements.length === 0) {
      return NextResponse.json({
        success: true,
        message: "XP未付与のミッション達成は見つかりませんでした",
        processed: 0,
        skipped: 0,
        errors: 0,
      });
    }

    // バッチ処理結果の統計
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const results: Array<{
      achievementId: string;
      userId: string;
      missionTitle: string;
      xpGranted?: number;
      status: "success" | "error" | "skipped";
      error?: string;
    }> = [];

    // バッチ処理用のトランザクションデータを準備
    const batchTransactions: Array<{
      userId: string;
      xpAmount: number;
      sourceType: "MISSION_COMPLETION" | "BONUS" | "PENALTY";
      sourceId?: string;
      description?: string;
      achievementId: string; // 結果レポート用
      missionTitle: string; // 結果レポート用
    }> = [];

    // 各達成のデータを検証してバッチに追加
    for (const achievement of missingXpAchievements) {
      const mission = Array.isArray(achievement.missions)
        ? achievement.missions[0]
        : achievement.missions;

      if (!mission) {
        console.warn(
          `達成ID ${achievement.id} のミッション情報が見つかりません`,
        );
        skippedCount++;
        results.push({
          achievementId: achievement.id,
          userId: achievement.user_id,
          missionTitle: "不明",
          status: "skipped",
          error: "ミッション情報が見つかりません",
        });
        continue;
      }

      const xpToGrant = calculateMissionXp(mission.difficulty);
      const description = `ミッション「${mission.title}」達成による経験値獲得`;

      batchTransactions.push({
        userId: achievement.user_id,
        xpAmount: xpToGrant,
        sourceType: "MISSION_COMPLETION",
        sourceId: achievement.id,
        description,
        achievementId: achievement.id,
        missionTitle: mission.title,
      });
    }

    console.log(`バッチ処理でXPを付与します: ${batchTransactions.length} 件`);

    // バッチでXPを一括付与
    const batchResult = await grantXpBatch(
      batchTransactions.map((tx) => ({
        userId: tx.userId,
        xpAmount: tx.xpAmount,
        sourceType: tx.sourceType,
        sourceId: tx.sourceId,
        description: tx.description,
      })),
    );

    if (!batchResult.success) {
      console.error("バッチXP付与に失敗:", batchResult.error);
      return NextResponse.json(
        {
          error: "バッチXP付与に失敗しました",
          details: batchResult.error,
        },
        { status: 500 },
      );
    }

    // バッチ結果を個別結果にマッピング
    const userResultMap = new Map(
      batchResult.results.map((result) => [result.userId, result]),
    );

    for (const transaction of batchTransactions) {
      const batchUserResult = userResultMap.get(transaction.userId);

      if (batchUserResult?.success) {
        processedCount++;
        results.push({
          achievementId: transaction.achievementId,
          userId: transaction.userId,
          missionTitle: transaction.missionTitle,
          xpGranted: transaction.xpAmount,
          status: "success",
        });
        console.log(
          `✓ 達成ID ${transaction.achievementId} にXP ${transaction.xpAmount} を付与しました`,
        );
      } else {
        errorCount++;
        results.push({
          achievementId: transaction.achievementId,
          userId: transaction.userId,
          missionTitle: transaction.missionTitle,
          status: "error",
          error: batchUserResult?.error || "XP付与に失敗しました",
        });
        console.error(
          `✗ 達成ID ${transaction.achievementId} のXP付与に失敗: ${batchUserResult?.error}`,
        );
      }
    }

    console.log("=== XP付与バッチ処理が完了しました ===");
    console.log(`処理成功: ${processedCount} 件`);
    console.log(`スキップ: ${skippedCount} 件`);
    console.log(`エラー: ${errorCount} 件`);

    return NextResponse.json({
      success: true,
      message: "XP付与バッチ処理が完了しました",
      summary: {
        total: missingXpAchievements.length,
        processed: processedCount,
        skipped: skippedCount,
        errors: errorCount,
      },
      results: results,
    });
  } catch (error) {
    console.error("バッチ処理でエラーが発生しました:", error);
    const errorMessage =
      error instanceof Error ? error.message : "予期しないエラーが発生しました";

    return NextResponse.json(
      {
        error: "バッチ処理でエラーが発生しました",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}

/**
 * バッチ処理の状況確認用GETエンドポイント
 */
export async function GET() {
  try {
    const supabase = await createServiceClient();

    // XP未付与の達成数を確認（IN句を使用してN+1クエリを回避）
    const { data: allAchievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("id")
      .order("created_at", { ascending: true });

    if (achievementsError) {
      return NextResponse.json(
        {
          error: "データの取得に失敗しました",
          details: achievementsError.message,
        },
        { status: 500 },
      );
    }

    let missingXpCount = 0;

    if (allAchievements && allAchievements.length > 0) {
      // 全ての達成IDに対するXPトランザクションを一括取得
      const achievementIds = allAchievements.map(
        (achievement) => achievement.id,
      );

      const { data: existingXpTransactions } = await executeChunkedQuery(
        achievementIds,
        async (chunkIds) => {
          return await supabase
            .from("xp_transactions")
            .select("source_id")
            .eq("source_type", "MISSION_COMPLETION")
            .in("source_id", chunkIds);
        },
        50,
      );

      // XPが付与済みの達成IDのSetを作成
      const processedAchievementIds = new Set(
        existingXpTransactions?.map((tx) => tx.source_id) || [],
      );

      // XP未付与の達成数を計算
      missingXpCount = allAchievements.filter(
        (achievement) => !processedAchievementIds.has(achievement.id),
      ).length;
    }

    // 統計情報を返却（count機能を使用して効率化）
    const { count: totalAchievements, error: countError } = await supabase
      .from("achievements")
      .select("*", { count: "exact", head: true });

    const { count: totalXpTransactions, error: xpCountError } = await supabase
      .from("xp_transactions")
      .select("*", { count: "exact", head: true })
      .eq("source_type", "MISSION_COMPLETION");

    return NextResponse.json({
      statistics: {
        totalAchievements: totalAchievements || 0,
        totalXpTransactions: totalXpTransactions || 0,
        missingXpAchievements: missingXpCount,
        completionRate: totalAchievements
          ? Math.round(
              ((totalAchievements - missingXpCount) / totalAchievements) * 100,
            )
          : 0,
      },
      message:
        missingXpCount > 0
          ? `${missingXpCount} 件のミッション達成にXPが付与されていません`
          : "すべてのミッション達成にXPが付与されています",
    });
  } catch (error) {
    console.error("統計取得でエラーが発生しました:", error);
    const errorMessage =
      error instanceof Error ? error.message : "予期しないエラーが発生しました";

    return NextResponse.json(
      {
        error: "統計取得でエラーが発生しました",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
