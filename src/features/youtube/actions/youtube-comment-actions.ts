"use server";

import { achieveMissionAction } from "@/features/mission-detail/actions/actions";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import {
  type DetectedUserComment,
  findUserCommentsInCache,
  generateCommentUrl,
  getRecentTeamMiraiVideos,
  getUserRecordedComments,
  getVideoInfoMap,
  syncVideoComments,
} from "../services/youtube-comment-service";
import {
  enrichCommentsWithVideoInfo,
  transformToRecordedComments,
} from "../utils/comment-transformers";

/**
 * 記録済みコメント情報
 */
export interface RecordedComment {
  commentId: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  channelTitle: string;
  textOriginal: string;
  videoPublishedAt: string | null;
  commentedAt: string;
  recordedAt: string;
}

/**
 * コメント検出結果
 */
export interface DetectCommentsResult {
  success: boolean;
  detectedComments?: DetectedUserComment[];
  error?: string;
}

/**
 * 自動達成結果
 */
export interface AutoAchieveResult {
  success: boolean;
  achievedCount: number;
  totalXpGranted: number;
  error?: string;
}

/**
 * 同期結果
 */
export interface SyncCommentsResult {
  success: boolean;
  syncedCommentCount: number;
  achievedCount: number;
  totalXpGranted: number;
  error?: string;
}

/**
 * YouTubeコメントを検出するServer Action
 * 連携済みユーザーのコメントをキャッシュから検出する
 */
export async function detectYouTubeCommentsAction(): Promise<DetectCommentsResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "ログインが必要です",
      };
    }

    // ユーザーのYouTubeチャンネルIDを取得
    const adminClient = await createAdminClient();
    const { data: connection } = await adminClient
      .from("youtube_user_connections")
      .select("channel_id")
      .eq("user_id", user.id)
      .single();

    if (!connection) {
      return {
        success: false,
        error: "YouTubeアカウントが連携されていません",
      };
    }

    // チャンネルID→ユーザーIDのマップを作成
    const channelIdToUserId = new Map([[connection.channel_id, user.id]]);

    // 直近1ヶ月の動画を取得
    const recentVideos = await getRecentTeamMiraiVideos();
    const videoIds = recentVideos.map((v) => v.videoId);

    // キャッシュからユーザーのコメントを検索
    const userCommentsMap = await findUserCommentsInCache(
      channelIdToUserId,
      videoIds,
    );
    const userComments = userCommentsMap.get(user.id) || [];

    // 既に記録済みのコメントを取得
    const recordedComments = await getUserRecordedComments(user.id);

    // 動画情報を取得
    const videoInfoMap = await getVideoInfoMap(videoIds);

    // 検出結果を整形
    const detectedComments = enrichCommentsWithVideoInfo(
      userComments,
      videoInfoMap,
      recordedComments,
    );

    return {
      success: true,
      detectedComments,
    };
  } catch (error) {
    console.error("Detect YouTube comments error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "コメントの検出に失敗しました",
    };
  }
}

/**
 * 検出されたコメントをミッション達成として記録するServer Action
 */
export async function recordYouTubeCommentAction(
  missionId: string,
  videoId: string,
  commentId: string,
): Promise<{ success: boolean; xpGranted?: number; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "ログインが必要です",
      };
    }

    // 既に記録済みか確認
    const { data: existingComment } = await supabase
      .from("youtube_user_comments")
      .select("id")
      .eq("user_id", user.id)
      .eq("comment_id", commentId)
      .maybeSingle();

    if (existingComment) {
      return {
        success: false,
        error: "このコメントは既に記録されています",
      };
    }

    // コメントURLを生成
    const commentUrl = generateCommentUrl(videoId, commentId);

    // achieveMissionActionを使ってミッション達成を記録
    const formData = new FormData();
    formData.append("missionId", missionId);
    formData.append("requiredArtifactType", "YOUTUBE_COMMENT");
    formData.append("artifactLink", commentUrl);

    const result = await achieveMissionAction(formData);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    // youtube_user_commentsにも記録を追加
    if (result.artifactId) {
      const { createYouTubeCommentRecord } = await import(
        "../services/youtube-comment-service"
      );
      const commentRecordResult = await createYouTubeCommentRecord(
        user.id,
        videoId,
        commentId,
        result.artifactId,
      );

      if (!commentRecordResult.success) {
        console.error(
          "Failed to create youtube_user_comments record:",
          commentRecordResult.error,
        );
        // ミッション達成は成功しているので、エラーとはしない
      }
    }

    return {
      success: true,
      xpGranted: result.xpGranted,
    };
  } catch (error) {
    console.error("Record YouTube comment error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "コメントの記録に失敗しました",
    };
  }
}

/**
 * YouTubeコメントを自動検出して、ミッション達成を自動で記録するServer Action
 */
export async function autoAchieveYouTubeCommentMissionAction(
  missionId: string,
): Promise<AutoAchieveResult> {
  try {
    // まずコメントを検出
    const detectResult = await detectYouTubeCommentsAction();
    if (!detectResult.success || !detectResult.detectedComments) {
      return {
        success: false,
        achievedCount: 0,
        totalXpGranted: 0,
        error: detectResult.error || "コメントの検出に失敗しました",
      };
    }

    // 未記録のコメントをフィルタ
    const unrecordedComments = detectResult.detectedComments.filter(
      (comment) => !comment.alreadyRecorded,
    );

    if (unrecordedComments.length === 0) {
      return {
        success: true,
        achievedCount: 0,
        totalXpGranted: 0,
      };
    }

    // 未記録のコメントを全て記録
    let achievedCount = 0;
    let totalXpGranted = 0;

    for (const comment of unrecordedComments) {
      const result = await recordYouTubeCommentAction(
        missionId,
        comment.videoId,
        comment.commentId,
      );
      if (result.success) {
        achievedCount++;
        totalXpGranted += result.xpGranted || 0;
      }
    }

    return {
      success: true,
      achievedCount,
      totalXpGranted,
    };
  } catch (error) {
    console.error("Auto achieve YouTube comment mission error:", error);
    return {
      success: false,
      achievedCount: 0,
      totalXpGranted: 0,
      error: error instanceof Error ? error.message : "自動達成に失敗しました",
    };
  }
}

/**
 * YouTubeコメントを同期し、自動でミッションクリアするServer Action
 * YouTube設定ページの同期ボタンから呼び出される
 *
 * 処理フロー:
 * 1. YouTube APIから直近1ヶ月の動画のコメントを取得 → youtube_video_comments にキャッシュ
 * 2. youtube_video_comments の全キャッシュから、ユーザーの未記録コメントを検出
 * 3. 検出したコメントを youtube_user_comments に記録 → ミッションクリア
 */
export async function syncYouTubeCommentsAction(): Promise<SyncCommentsResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        syncedCommentCount: 0,
        achievedCount: 0,
        totalXpGranted: 0,
        error: "ログインが必要です",
      };
    }

    // ユーザーのYouTubeチャンネルIDを取得
    const adminClient = await createAdminClient();
    const { data: connection } = await adminClient
      .from("youtube_user_connections")
      .select("channel_id")
      .eq("user_id", user.id)
      .single();

    if (!connection) {
      return {
        success: false,
        syncedCommentCount: 0,
        achievedCount: 0,
        totalXpGranted: 0,
        error: "YouTubeアカウントが連携されていません",
      };
    }

    // 直近1ヶ月の動画を取得
    const recentVideos = await getRecentTeamMiraiVideos();

    // 各動画のコメントをYouTube APIから同期（キャッシュに保存）
    let totalSyncedComments = 0;
    for (const video of recentVideos) {
      try {
        const result = await syncVideoComments(video.videoId, 500);
        totalSyncedComments += result.newCommentsCount;
      } catch (error) {
        console.error(
          `Failed to sync comments for video ${video.videoId}:`,
          error,
        );
        // 1つの動画の失敗で全体を止めない
      }
    }

    // YouTubeコメントミッションを取得
    const { data: commentMission } = await adminClient
      .from("missions")
      .select("id")
      .eq("slug", "youtube-comment")
      .single();

    if (!commentMission) {
      return {
        success: true,
        syncedCommentCount: totalSyncedComments,
        achievedCount: 0,
        totalXpGranted: 0,
        error: "YouTubeコメントミッションが見つかりません",
      };
    }

    // キャッシュ全体からユーザーの未記録コメントを検出して記録
    // （直近1ヶ月の動画に限定せず、全キャッシュをチェック）
    const channelIdToUserId = new Map([[connection.channel_id, user.id]]);

    const userCommentsMap = await findUserCommentsInCache(channelIdToUserId);
    const userComments = userCommentsMap.get(user.id) || [];

    // 既に記録済みのコメントを取得
    const recordedComments = await getUserRecordedComments(user.id);

    // 未記録のコメントをフィルタ
    const unrecordedComments = userComments.filter(
      (comment) => !recordedComments.has(comment.commentId),
    );

    // 未記録のコメントを全て記録
    let achievedCount = 0;
    let totalXpGranted = 0;

    for (const comment of unrecordedComments) {
      const result = await recordYouTubeCommentAction(
        commentMission.id,
        comment.videoId,
        comment.commentId,
      );
      if (result.success) {
        achievedCount++;
        totalXpGranted += result.xpGranted || 0;
      }
    }

    return {
      success: true,
      syncedCommentCount: totalSyncedComments,
      achievedCount,
      totalXpGranted,
    };
  } catch (error) {
    console.error("Sync YouTube comments error:", error);
    return {
      success: false,
      syncedCommentCount: 0,
      achievedCount: 0,
      totalXpGranted: 0,
      error: error instanceof Error ? error.message : "同期に失敗しました",
    };
  }
}

/**
 * 記録済みのコメント一覧を取得するServer Action
 */
export async function getRecordedCommentsAction(): Promise<{
  success: boolean;
  comments?: RecordedComment[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "ログインが必要です",
      };
    }

    const adminClient = await createAdminClient();

    // youtube_user_commentsからユーザーのコメント記録を取得
    const { data: userComments, error: commentsError } = await adminClient
      .from("youtube_user_comments")
      .select(
        `
        comment_id,
        video_id,
        detected_at,
        youtube_video_comments!inner (
          text_original,
          published_at
        ),
        youtube_videos!inner (
          title,
          channel_title,
          thumbnail_url,
          published_at
        )
      `,
      )
      .eq("user_id", user.id)
      .order("detected_at", { ascending: false })
      .limit(100);

    if (commentsError) {
      console.error("Failed to fetch user comments:", commentsError);
      return {
        success: false,
        error: "コメント一覧の取得に失敗しました",
      };
    }

    const comments = transformToRecordedComments(
      (userComments || []) as Parameters<typeof transformToRecordedComments>[0],
    );

    return {
      success: true,
      comments,
    };
  } catch (error) {
    console.error("Get recorded comments error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "コメント一覧の取得に失敗しました",
    };
  }
}
