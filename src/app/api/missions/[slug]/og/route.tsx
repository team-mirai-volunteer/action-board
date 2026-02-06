import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getMissionPageData } from "@/features/mission-detail/services/mission-detail";
import { formatTitleWithLineBreaks, isVotingMission } from "./og-helpers";

// キャッシュ用Mapを定義（メモリキャッシュ）- completeタイプのみキャッシュ
// キーはslugベースで管理
const MAX_CACHE_SIZE = 100;
const cache = new Map<string, ArrayBuffer>();

const size = {
  width: 1200,
  height: 630,
};

async function loadGoogleFont(font: string, text: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${font}:wght@700&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const resource = css.match(
      /src:\s*url\(([^)]+)\)\s*format\('(opentype|truetype|woff2)'\)/,
    );

    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status === 200) {
        return await response.arrayBuffer();
      }
    }
    throw new Error("Font resource not found");
  } catch (error) {
    console.error("Font loading failed:", error);
    // フォールバック: システムフォントを使用
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (typeof slug !== "string") {
    return new Response("Invalid mission identifier", { status: 400 });
  }

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // getMissionPageDataはslugとUUID両方に対応
  const pageData = await getMissionPageData(slug);
  if (!pageData) {
    return new Response("Mission not found", { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");

  const votingMission = isVotingMission(pageData?.mission.slug || "");

  // キャッシュキーはslugベースで統一
  const cacheKey = pageData.mission.slug;

  if (type === "complete") {
    if (cache.has(cacheKey)) {
      const buf = cache.get(cacheKey);
      if (buf) {
        return new Response(buf, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      }
    }
  }

  let baseImageBase64 = "";

  try {
    // ベース画像を読み込み
    let baseImageFileName = "";
    if (votingMission) {
      baseImageFileName = "public/img/ogp_mission_vote.png";
    } else if (type === "complete") {
      baseImageFileName = "public/img/ogp_mission_complete_base.png";
    } else {
      baseImageFileName = "public/img/ogp_mission_base.png";
    }
    const baseImagePath = join(process.cwd(), baseImageFileName);
    const baseImageBuffer = await readFile(baseImagePath);
    baseImageBase64 = `data:image/png;base64,${baseImageBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Base image loading failed:", error);
    return new Response("Base image not found", { status: 500 });
  }

  const title = pageData?.mission.title ?? "ミッションが見つかりません";
  const titleWithLineBreak = formatTitleWithLineBreaks(title);

  const fontData = await loadGoogleFont(
    "Noto+Sans+JP",
    `${pageData?.mission.title ?? ""} #テクノロジーで誰も取り残さない日本へ ${pageData?.totalAchievementCount ?? 0}件のアクションが達成されました！`,
  );

  let imageResponse: ImageResponse;

  if (votingMission) {
    // 投票ミッションの場合は画像のみ表示（文字オーバーレイなし）
    imageResponse = new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundImage: `url(${baseImageBase64})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />,
      { ...size },
    );
  } else if (type === "complete") {
    imageResponse = new ImageResponse(
      <div
        style={{
          fontFamily: "Noto Sans JP",
          width: "100%",
          height: "100%",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          backgroundImage: `url(${baseImageBase64})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            width: "90%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "80px",
          }}
        >
          <div
            style={{
              fontSize: 36,
              color: "black",
              fontWeight: "700",
              marginBottom: "8px",
              whiteSpace: "pre-wrap",
              textAlign: "center",
            }}
          >
            {`「${title}」\nを達成しました！`}
          </div>
        </div>
      </div>,
      {
        ...size,
        fonts: fontData
          ? [
              {
                name: "Noto Sans JP",
                data: fontData,
                weight: 700,
                style: "normal",
              },
            ]
          : [],
      },
    );
  } else {
    imageResponse = new ImageResponse(
      <div
        style={{
          fontFamily: "Noto Sans JP",
          width: "100%",
          height: "100%",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "center",
          backgroundImage: `url(${baseImageBase64})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            width: "62%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 40,
              color: "black",
              fontWeight: "700",
              marginBottom: "8px",
              whiteSpace: "pre-wrap",
            }}
          >
            {titleWithLineBreak}
          </div>
          <div
            style={{
              fontFamily: "Noto Sans JP",
              fontSize: 28,
              color: "black",
              fontWeight: "700",
              marginBottom: "24px",
            }}
          >
            #テクノロジーで誰も取り残さない日本へ
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "baseline",
            }}
          >
            <div
              style={{
                fontFamily: "Noto Sans JP",
                fontSize: "58px",
                color: "#0d9488",
                textAlign: "center",
                lineHeight: "1",
              }}
            >
              {(pageData?.totalAchievementCount ?? 0).toLocaleString()}
            </div>
            <div
              style={{
                marginLeft: "8px",
                fontFamily: "Noto Sans JP",
                fontSize: "24px",
                color: "#0d9488",
                textAlign: "center",
              }}
            >
              件のアクションが達成されました！
            </div>
          </div>
        </div>
      </div>,
      {
        ...size,
        fonts: fontData
          ? [
              {
                name: "Noto Sans JP",
                data: fontData,
                weight: 700,
                style: "normal",
              },
            ]
          : [],
      },
    );
  }

  // ImageResponseからArrayBufferを取得
  const buf = await imageResponse.arrayBuffer();

  if (type === "complete") {
    // キャッシュサイズ制限（FIFO方式）
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      if (typeof firstKey === "string") {
        cache.delete(firstKey);
      }
    }

    cache.set(cacheKey, buf);
  }

  return new Response(buf, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
