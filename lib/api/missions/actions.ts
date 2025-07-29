"use server";

import { ARTIFACT_TYPES } from "@/lib/artifactTypes";
import { grantMissionCompletionXp } from "@/lib/services/userLevel";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const missionFormBaseSchema = z.object({
  missionId: z.string(),
  requiredArtifactType: z.string(),
  artifactDescription: z.string().optional(),
});

const linkArtifactSchema = missionFormBaseSchema.extend({
  artifactLink: z.string().url(),
});

export async function achieveMissionAction(formData: FormData) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "認証が必要です" };
    }

    const missionId = formData.get("missionId") as string;
    const requiredArtifactType = formData.get("requiredArtifactType") as string;
    const artifactDescription = formData.get("artifactDescription") as string;

    if (!missionId || !requiredArtifactType) {
      return { success: false, error: "必要な情報が不足しています" };
    }

    const artifactData: Record<string, unknown> = {};

    if (requiredArtifactType === ARTIFACT_TYPES.LINK.key) {
      const artifactLink = formData.get("artifactLink") as string;
      const validatedData = linkArtifactSchema.parse({
        missionId,
        requiredArtifactType,
        artifactLink,
        artifactDescription,
      });
      artifactData.link = validatedData.artifactLink;
    } else if (requiredArtifactType === ARTIFACT_TYPES.TEXT.key) {
      const artifactText = formData.get("artifactText") as string;
      if (!artifactText) {
        return { success: false, error: "テキストを入力してください" };
      }
      artifactData.text = artifactText;
    } else if (requiredArtifactType === ARTIFACT_TYPES.EMAIL.key) {
      const artifactEmail = formData.get("artifactEmail") as string;
      if (!artifactEmail) {
        return { success: false, error: "メールアドレスを入力してください" };
      }
      artifactData.email = artifactEmail;
    } else if (requiredArtifactType === ARTIFACT_TYPES.IMAGE.key) {
      const artifactImagePath = formData.get("artifactImagePath") as string;
      if (!artifactImagePath) {
        return { success: false, error: "画像をアップロードしてください" };
      }
      artifactData.image_path = artifactImagePath;
    } else if (
      requiredArtifactType === ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key
    ) {
      const artifactImagePath = formData.get("artifactImagePath") as string;
      const latitude = formData.get("latitude") as string;
      const longitude = formData.get("longitude") as string;

      if (!artifactImagePath) {
        return { success: false, error: "画像をアップロードしてください" };
      }

      artifactData.image_path = artifactImagePath;

      if (latitude && longitude) {
        artifactData.latitude = Number.parseFloat(latitude);
        artifactData.longitude = Number.parseFloat(longitude);

        const accuracy = formData.get("accuracy") as string;
        const altitude = formData.get("altitude") as string;

        if (accuracy) artifactData.accuracy = Number.parseFloat(accuracy);
        if (altitude) artifactData.altitude = Number.parseFloat(altitude);
      }
    } else if (requiredArtifactType === ARTIFACT_TYPES.POSTING.key) {
      const postingCount = formData.get("postingCount") as string;
      const locationText = formData.get("locationText") as string;

      if (!postingCount) {
        return { success: false, error: "配布枚数を入力してください" };
      }

      const count = Number.parseInt(postingCount, 10);
      if (Number.isNaN(count) || count <= 0) {
        return { success: false, error: "有効な配布枚数を入力してください" };
      }

      artifactData.posting_count = count;
      if (locationText) {
        artifactData.location_text = locationText;
      }
    } else if (requiredArtifactType === ARTIFACT_TYPES.POSTER.key) {
      const posterType = formData.get("posterType") as string;
      const posterCount = formData.get("posterCount") as string;
      const posterLocation = formData.get("posterLocation") as string;

      if (!posterType || !posterCount) {
        return { success: false, error: "ポスター情報を入力してください" };
      }

      const count = Number.parseInt(posterCount, 10);
      if (Number.isNaN(count) || count <= 0) {
        return {
          success: false,
          error: "有効なポスター枚数を入力してください",
        };
      }

      artifactData.poster_type = posterType;
      artifactData.poster_count = count;
      if (posterLocation) {
        artifactData.poster_location = posterLocation;
      }
    } else if (requiredArtifactType === ARTIFACT_TYPES.QUIZ.key) {
      const quizAnswers = formData.get("quizAnswers") as string;
      if (!quizAnswers) {
        return { success: false, error: "クイズの回答が必要です" };
      }
      artifactData.quiz_answers = quizAnswers;
    } else if (requiredArtifactType === ARTIFACT_TYPES.LINK_ACCESS.key) {
      artifactData.link_accessed = true;
    }

    const { data: achievementData, error: achievementError } = await supabase
      .from("achievements")
      .insert({
        user_id: user.id,
        mission_id: missionId,
      })
      .select()
      .single();

    if (achievementError) {
      console.error("Achievement error:", achievementError);
      return { success: false, error: "達成記録の保存に失敗しました" };
    }

    const { data: insertData, error: insertError } = await supabase
      .from("mission_artifacts")
      .insert({
        achievement_id: achievementData.id,
        user_id: user.id,
        artifact_type: requiredArtifactType,
        description: artifactDescription || null,
        image_storage_path: (artifactData.image_path as string) || null,
        link_url: (artifactData.link as string) || null,
        text_content:
          (artifactData.text as string) ||
          (artifactData.email as string) ||
          null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return { success: false, error: "データの保存に失敗しました" };
    }

    if (
      requiredArtifactType === ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key &&
      artifactData.latitude &&
      artifactData.longitude
    ) {
      const { error: geoError } = await supabase
        .from("mission_artifact_geolocations")
        .insert({
          mission_artifact_id: insertData.id,
          lat: artifactData.latitude as number,
          lon: artifactData.longitude as number,
          accuracy: (artifactData.accuracy as number) || null,
          altitude: (artifactData.altitude as number) || null,
        });

      if (geoError) {
        console.error("Geolocation insert error:", geoError);
      }
    }

    if (achievementError) {
      console.error("Achievement error:", achievementError);
      return { success: false, error: "達成記録の保存に失敗しました" };
    }

    const userLevelResult = await grantMissionCompletionXp(
      user.id,
      missionId,
      achievementData.id,
    );

    if (!userLevelResult.success) {
      console.error("XP grant error:", userLevelResult.error);
    }

    revalidatePath(`/missions/${missionId}`);
    revalidatePath("/");

    return {
      success: true,
      achievementId: achievementData.id,
      xpGranted: userLevelResult.xpGranted,
      userLevel: userLevelResult.userLevel,
    };
  } catch (error) {
    console.error("Mission achievement error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

export async function cancelSubmissionAction(formData: FormData) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "認証が必要です" };
    }

    const submissionId = formData.get("submissionId") as string;

    if (!submissionId) {
      return { success: false, error: "投稿IDが必要です" };
    }

    const { data: achievement, error: fetchError } = await supabase
      .from("achievements")
      .select("mission_id")
      .eq("id", submissionId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !achievement) {
      return { success: false, error: "投稿が見つかりません" };
    }

    const { error: deleteArtifactError } = await supabase
      .from("mission_artifacts")
      .delete()
      .eq("achievement_id", submissionId)
      .eq("user_id", user.id);

    if (deleteArtifactError) {
      console.error("Delete artifact error:", deleteArtifactError);
    }

    const { error: deleteAchievementError } = await supabase
      .from("achievements")
      .delete()
      .eq("id", submissionId)
      .eq("user_id", user.id);

    if (deleteAchievementError) {
      console.error("Delete achievement error:", deleteAchievementError);
      return { success: false, error: "達成記録の削除に失敗しました" };
    }

    revalidatePath(`/missions/${achievement.mission_id}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Cancel submission error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}
