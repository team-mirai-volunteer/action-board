import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Database } from "@/lib/types/supabase";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// 環境変数を読み込み（.env.localを優先）
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

type AdminBoundaryInsert =
  Database["public"]["Tables"]["admin_boundaries"]["Insert"];

interface GeoJSONFeature {
  type: "Feature";
  properties: {
    N03_001?: string; // 都道府県名
    N03_002?: string; // 振興局・支庁名
    N03_003?: string; // 郡・市名
    N03_004?: string; // 町・字等名
    N03_007?: string; // 行政区域コード
    [key: string]: unknown;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][]; // Polygon: [rings], MultiPolygon: [polygons]
  };
}

interface GeoJSONData {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

/**
 * GeoJSONファイルを読み込んでDBにインポート
 */
export async function importGeoJSONToDB(
  filePath: string,
  skipThreshold = 500,
): Promise<void> {
  console.log(`GeoJSONファイルを読み込み中: ${filePath}`);

  // ファイルの存在確認
  if (!existsSync(filePath)) {
    throw new Error(`ファイルが見つかりません: ${filePath}`);
  }

  // GeoJSONファイルを読み込み
  const fileContent = readFileSync(filePath, "utf-8");
  let geoJsonData: GeoJSONData;

  try {
    geoJsonData = JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`GeoJSONファイルの解析に失敗しました: ${error}`);
  }

  if (!geoJsonData.features || !Array.isArray(geoJsonData.features)) {
    throw new Error("無効なGeoJSONフォーマットです");
  }

  console.log(`${geoJsonData.features.length}件のフィーチャーが見つかりました`);

  // Geometry型の統計を確認
  const geometryTypes = geoJsonData.features.reduce(
    (acc, feature) => {
      const type = feature.geometry.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log("Geometry型の内訳:", geometryTypes);

  // Supabaseクライアントを作成
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Supabaseの環境変数が設定されていません。NEXT_PUBLIC_SUPABASE_URLとSUPABASE_SERVICE_ROLE_KEYを確認してください。",
    );
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

  // バッチサイズ
  const BATCH_SIZE = 100;
  let insertedCount = 0;
  let errorCount = 0;
  let skippedCount = 0; // 重複でスキップされた件数

  console.log("既存の行政区域データを確認中...");
  const existingBoundaries = await getExistingBoundariesMap(supabase);

  // 行政区域ごとにポリゴンをグループ化
  const boundaryGroups: Record<string, GeoJSONFeature[]> = {};

  for (const feature of geoJsonData.features) {
    try {
      const adminBoundary = convertFeatureToAdminBoundary(feature);
      if (adminBoundary) {
        const boundaryKey = createBoundaryKey(adminBoundary);

        // 既存データがある場合はスキップ
        if (existingBoundaries.has(boundaryKey)) {
          skippedCount++;
          continue;
        }

        // 新しいデータをグループ化
        if (!boundaryGroups[boundaryKey]) {
          boundaryGroups[boundaryKey] = [];
        }
        boundaryGroups[boundaryKey].push(feature);
      }
    } catch (error) {
      console.error("フィーチャーの変換に失敗:", error);
      errorCount++;
    }
  }

  console.log(
    `グループ化完了: ${Object.keys(boundaryGroups).length}件の行政区域`,
  );

  // グループ化されたポリゴンをマージしてインポート
  const adminBoundaries: AdminBoundaryInsert[] = [];
  let mergedCount = 0;
  let largePolygonSkipped = 0;
  let bigPolygonProcessed = 0; // 分割処理された大ポリゴンの数
  const skippedDetails: Array<{ key: string; count: number }> = [];
  const LARGE_POLYGON_THRESHOLD = Math.min(skipThreshold, 1000); // 分割処理の閾値

  for (const boundaryKey of Object.keys(boundaryGroups)) {
    const features = boundaryGroups[boundaryKey];

    try {
      // 非常に大きなポリゴン数の場合はスキップ
      if (features.length > skipThreshold) {
        // 分割処理を試行する場合
        if (features.length <= LARGE_POLYGON_THRESHOLD) {
          console.log(
            `🔄 大ポリゴン分割処理を試行: ${boundaryKey} (${features.length}件)`,
          );

          const result = await processBigPolygonInBatches(
            features,
            boundaryKey,
            supabase,
            skipThreshold,
          );

          if (result.success) {
            insertedCount += result.insertedCount;
            bigPolygonProcessed++;
            mergedCount++; // 分割処理された場合もマージとしてカウント
            continue;
          }

          console.warn(`⚠️  分割処理も失敗したためスキップ: ${boundaryKey}`);
        }

        console.warn(
          `⚠️  スキップ: ${boundaryKey} (${features.length}件のポリゴン - 閾値${skipThreshold}件を超過)`,
        );
        skippedDetails.push({ key: boundaryKey, count: features.length });
        largePolygonSkipped++;
        skippedCount += features.length;
        continue;
      }

      // ポリゴンをマージ
      const mergedFeature = mergePolygons(features);
      const adminBoundary = convertFeatureToAdminBoundary(mergedFeature);

      if (adminBoundary) {
        // マージ情報を追加
        adminBoundary.is_merged = features.length > 1;
        adminBoundary.original_count = features.length;

        adminBoundaries.push(adminBoundary);

        if (features.length > 1) {
          mergedCount++;
          console.log(
            `マージ: ${boundaryKey} (${features.length}件のポリゴン)`,
          );
        }
      }
    } catch (error) {
      console.error(`マージエラー (${boundaryKey}):`, error);
      errorCount++;
    }
  }

  // データベースにバッチ挿入
  const INSERT_BATCH_SIZE = 1; // さらに小さなバッチサイズ
  insertedCount = 0; // 既存変数を再利用

  if (adminBoundaries.length > 0) {
    console.log(`${adminBoundaries.length}件をバッチ挿入中...`);

    for (let i = 0; i < adminBoundaries.length; i += INSERT_BATCH_SIZE) {
      const batch = adminBoundaries.slice(i, i + INSERT_BATCH_SIZE);

      try {
        const { error } = await supabase.from("admin_boundaries").insert(batch);

        if (error) {
          console.error(
            `バッチ ${Math.floor(i / INSERT_BATCH_SIZE) + 1} 挿入エラー:`,
            error,
          );
          errorCount += batch.length;
        } else {
          insertedCount += batch.length;
          console.log(
            `バッチ ${Math.floor(i / INSERT_BATCH_SIZE) + 1}: ${batch.length}件挿入完了 (合計: ${insertedCount}件)`,
          );
        }
      } catch (error) {
        console.error(
          `バッチ ${Math.floor(i / INSERT_BATCH_SIZE) + 1} 挿入エラー:`,
          error,
        );
        errorCount += batch.length;
      }

      // バッチ間で少し待機（データベース負荷軽減）
      if (i + INSERT_BATCH_SIZE < adminBoundaries.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  console.log("インポート完了:");
  console.log(`  - 挿入成功: ${insertedCount}件`);
  console.log(`  - マージ済み: ${mergedCount}件`);
  console.log(`  - 大ポリゴン分割処理: ${bigPolygonProcessed}件`);
  console.log(`  - 重複スキップ: ${skippedCount}件`);
  console.log(`  - 大ポリゴン数でスキップ: ${largePolygonSkipped}件`);
  console.log(`  - エラー: ${errorCount}件`);

  // スキップされた自治体の詳細をまとめて出力
  if (skippedDetails.length > 0) {
    console.log("\n=== スキップされた自治体の詳細 ===");
    console.log(
      `合計 ${skippedDetails.length} 件の自治体がポリゴン数が多すぎるためスキップされました:`,
    );

    // ポリゴン数でソート（降順）
    const sortedSkipped = skippedDetails.sort((a, b) => b.count - a.count);

    for (const { key, count } of sortedSkipped) {
      console.log(`  - ${key}: ${count}件のポリゴン`);
    }

    console.log(
      `\n⚠️  これらの自治体のデータは現在のスキップ閾値（${skipThreshold}件）を超えているため処理されませんでした。`,
    );
    console.log(
      "    必要に応じて閾値を調整するか、個別に処理を検討してください。",
    );
  }
}

/**
 * GeoJSONフィーチャーをAdminBoundaryに変換
 */
function convertFeatureToAdminBoundary(
  feature: GeoJSONFeature,
): AdminBoundaryInsert | null {
  const props = feature.properties;

  // 必須フィールドのチェック
  if (!props.N03_001 || !props.N03_007) {
    console.warn("必須フィールドが不足しています:", props);
    return null;
  }

  // 都道府県コードを抽出（行政区域コードの最初の2桁）
  const prefectureCode = props.N03_007.substring(0, 2);

  // 住所を構築
  const addressParts = [
    props.N03_001, // 都道府県名
    props.N03_002, // 振興局・支庁名
    props.N03_003, // 郡・市名
    props.N03_004, // 町・字等名
  ].filter(Boolean);

  const fullAddress = addressParts.join("");

  // GeometryをMultiPolygonに変換
  let geometry = feature.geometry;

  // PolygonをMultiPolygonに変換
  if (geometry.type === "Polygon") {
    geometry = {
      type: "MultiPolygon",
      coordinates: [geometry.coordinates as number[][][]],
    };
  } else if (geometry.type !== "MultiPolygon") {
    console.warn(
      `サポートされていないGeometry型: ${geometry.type} (${fullAddress})`,
    );
    return null;
  }

  return {
    prefecture_code: prefectureCode,
    prefecture_name: props.N03_001,
    city_name: props.N03_003 || null,
    district_name: props.N03_004 || null,
    area_name: props.N03_002 || null,
    additional_code: props.N03_007,
    full_address: fullAddress,
    geojson:
      geometry as Database["public"]["Tables"]["admin_boundaries"]["Insert"]["geojson"],
    properties:
      props as Database["public"]["Tables"]["admin_boundaries"]["Insert"]["properties"],
  };
}

/**
 * 特定の都道府県コードのデータを削除
 */
export async function deleteAdminBoundariesByPrefecture(
  prefectureCode: string,
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabaseの環境変数が設定されていません。");
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

  const { error } = await supabase
    .from("admin_boundaries")
    .delete()
    .eq("prefecture_code", prefectureCode);

  if (error) {
    throw new Error(`都道府県データの削除に失敗しました: ${error.message}`);
  }

  console.log(`都道府県コード ${prefectureCode} のデータを削除しました`);
}

/**
 * 行政区域の重複をチェックする
 */
export async function mergeAdminBoundaries(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabaseの環境変数が設定されていません。");
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

  console.log("行政区域の重複チェックを実行中...");

  // 重複チェックを実行
  await checkDuplicateAreasDetailed();

  console.log("重複チェック完了。重複がある場合は上記に表示されます。");
}

/**
 * 重複チェック - 同じ行政区域で複数のポリゴンがあるかどうか確認
 */
export async function checkDuplicateAreas(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabaseの環境変数が設定されていません。");
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

  console.log("重複する行政区域を確認中...");

  const { data, error } = await supabase
    .from("admin_boundaries")
    .select(`
      prefecture_code,
      prefecture_name,
      city_name,
      district_name,
      area_name,
      full_address
    `)
    .eq("is_merged", false);

  if (error) {
    throw new Error(`重複チェックに失敗しました: ${error.message}`);
  }

  // 同じ行政区域でグループ化（prefecture_name, city_name, district_nameで統合）
  const groupedData = data.reduce(
    (acc, item) => {
      const key = `${item.prefecture_name}-${item.city_name || ""}-${item.district_name || ""}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, typeof data>,
  );

  // 重複があるものを表示
  const duplicates = Object.entries(groupedData).filter(
    ([_, items]) => items.length > 1,
  );

  if (duplicates.length > 0) {
    console.log(`\n${duplicates.length}件の重複する行政区域が見つかりました:`);
    for (const [, items] of duplicates) {
      console.log(`- ${items[0].full_address}: ${items.length}個のポリゴン`);
    }
    console.log(
      "\nマージを実行するには --merge オプションを使用してください。",
    );
  } else {
    console.log("重複する行政区域は見つかりませんでした。");
  }
}

/**
 * データベーススキーマの確認
 */
export async function ensureDatabaseSchema(): Promise<void> {
  console.log("⚠️  マイグレーションの確認が必要です。");
  console.log("以下のコマンドでマイグレーションを実行してください:");
  console.log("  supabase migration up");
  console.log("または、手動で以下のSQLを実行してください:");
  console.log(`
    ALTER TABLE admin_boundaries 
    ADD COLUMN IF NOT EXISTS is_merged BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS original_count INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS geometry GEOMETRY(MULTIPOLYGON, 4326);
    
    CREATE INDEX IF NOT EXISTS idx_admin_boundaries_is_merged ON admin_boundaries(is_merged);
  `);
}

/**
 * 詳細な重複チェック - データベースの状況を詳しく確認
 */
export async function checkDuplicateAreasDetailed(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabaseの環境変数が設定されていません。");
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

  console.log("詳細な重複チェックを実行中...");

  // まずスキーマを確認
  await ensureDatabaseSchema();

  // 全データの統計（型アサーションを使用）
  const { data: allData, error: allError } = await supabase
    .from("admin_boundaries")
    .select("*");

  if (allError) {
    throw new Error(`データ取得に失敗しました: ${allError.message}`);
  }

  // 型アサーション：拡張された型を使用
  const dataWithMerge = allData as Array<{
    prefecture_code: string;
    prefecture_name: string;
    city_name: string | null;
    district_name: string | null;
    area_name: string | null;
    additional_code: string | null;
    full_address: string;
    is_merged?: boolean;
  }>;

  console.log("\n=== データベース統計 ===");
  console.log(`総レコード数: ${dataWithMerge.length}`);

  const mergedCount = dataWithMerge.filter((item) => item.is_merged).length;
  const unmergedCount = dataWithMerge.filter((item) => !item.is_merged).length;

  console.log(`マージ済み: ${mergedCount}件`);
  console.log(`未マージ: ${unmergedCount}件`);

  // prefecture_name, city_name, district_nameでの重複チェック
  const groupByPCD = dataWithMerge.reduce(
    (acc, item) => {
      // "null" 文字列とnull値の両方をNULLとして扱う
      const cityName =
        item.city_name === "null" ||
        item.city_name === null ||
        item.city_name === undefined
          ? "NULL"
          : item.city_name;
      const districtName =
        item.district_name === "null" ||
        item.district_name === null ||
        item.district_name === undefined
          ? "NULL"
          : item.district_name;
      const key = `${item.prefecture_name}-${cityName}-${districtName}`;
      if (!acc[key]) {
        acc[key] = { merged: [], unmerged: [] };
      }
      if (item.is_merged) {
        acc[key].merged.push(item);
      } else {
        acc[key].unmerged.push(item);
      }
      return acc;
    },
    {} as Record<
      string,
      { merged: typeof dataWithMerge; unmerged: typeof dataWithMerge }
    >,
  );

  const duplicatesPCD = Object.entries(groupByPCD).filter(
    ([_, items]) => items.unmerged.length > 1,
  );

  console.log("\n=== prefecture_name + city_name + district_name での重複 ===");
  if (duplicatesPCD.length > 0) {
    console.log(`${duplicatesPCD.length}件の重複グループが見つかりました:`);
    for (const [key, items] of duplicatesPCD.slice(0, 10)) {
      // 最初の10件のみ表示
      console.log(
        `- ${key}: ${items.unmerged.length}個の未マージポリゴン, ${items.merged.length}個のマージ済み`,
      );
      if (items.unmerged.length > 0) {
        console.log(
          `  area_name例: ${items.unmerged.map((i) => i.area_name || "null").join(", ")}`,
        );
        console.log(
          `  additional_code例: ${items.unmerged.map((i) => i.additional_code || "null").join(", ")}`,
        );
      }
    }
    if (duplicatesPCD.length > 10) {
      console.log(`  ... 他 ${duplicatesPCD.length - 10} 件`);
    }
  } else {
    console.log("重複する行政区域は見つかりませんでした。");
  }

  // 完全一致での重複チェック（すべてのフィールド）
  const groupByAll = dataWithMerge.reduce(
    (acc, item) => {
      // "null" 文字列とnull値の両方をNULLとして扱う
      const cityName =
        item.city_name === "null" ||
        item.city_name === null ||
        item.city_name === undefined
          ? "NULL"
          : item.city_name;
      const districtName =
        item.district_name === "null" ||
        item.district_name === null ||
        item.district_name === undefined
          ? "NULL"
          : item.district_name;
      const areaName =
        item.area_name === "null" ||
        item.area_name === null ||
        item.area_name === undefined
          ? "NULL"
          : item.area_name;
      const additionalCode =
        item.additional_code === "null" ||
        item.additional_code === null ||
        item.additional_code === undefined
          ? "NULL"
          : item.additional_code;
      const key = `${item.prefecture_name}-${cityName}-${districtName}-${areaName}-${additionalCode}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, typeof dataWithMerge>,
  );

  const duplicatesAll = Object.entries(groupByAll).filter(
    ([_, items]) => items.filter((i) => !i.is_merged).length > 1,
  );

  console.log("\n=== 全フィールド完全一致での重複 ===");
  if (duplicatesAll.length > 0) {
    console.log(`${duplicatesAll.length}件の完全重複が見つかりました:`);
    for (const [key, items] of duplicatesAll.slice(0, 5)) {
      // 最初の5件のみ表示
      const unmergedItems = items.filter((i) => !i.is_merged);
      console.log(
        `- ${items[0].full_address}: ${unmergedItems.length}個の重複レコード`,
      );
    }
  } else {
    console.log("完全一致での重複は見つかりませんでした。");
  }
}

/**
 * メイン実行関数
 */
export async function main() {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log("使用方法:");
      console.log("  npm run import-geojson <geojson-file-path>");
      console.log(
        "  npm run import-geojson <geojson-file-path> --no-merge  # マージを無効化",
      );
      console.log(
        "  npm run import-geojson <geojson-file-path> --replace-prefecture <prefecture-code>",
      );
      console.log(
        "  npm run import-geojson <geojson-file-path> --skip-threshold <number>  # スキップ閾値を指定",
      );
      console.log(
        "  npm run import-geojson --check-schema      # データベーススキーマ確認",
      );
      console.log("  npm run import-geojson --check-duplicates  # 重複確認");
      console.log(
        "  npm run import-geojson --merge            # ポリゴンマージ",
      );
      console.log("");
      console.log("注意: インポート時はデフォルトでマージが実行されます。");
      console.log(
        "     同じ prefecture_name, city_name, district_name のデータが統合されます。",
      );
      console.log("     デフォルトのスキップ閾値は200件です。");
      console.log("");
      console.log("⚠️  初回実行前にマイグレーションを適用してください:");
      console.log("     supabase migration up");
      return;
    }

    // スキーマ確認のみ
    if (args[0] === "--check-schema") {
      await ensureDatabaseSchema();
      return;
    }

    // 重複チェックのみ
    if (args[0] === "--check-duplicates") {
      try {
        await checkDuplicateAreasDetailed();
      } catch (error) {
        console.error(
          "詳細チェックでエラーが発生しました。基本チェックを実行します:",
        );
        await checkDuplicateAreas();
      }
      return;
    }

    // 重複チェック（旧マージコマンド）
    if (args[0] === "--merge") {
      await mergeAdminBoundaries();
      return;
    }

    const filePath = args[0];
    const replaceIndex = args.indexOf("--replace-prefecture");
    const prefectureCode = replaceIndex !== -1 ? args[replaceIndex + 1] : null;
    const shouldMerge = args.includes("--merge");

    // スキップ閾値の解析
    const skipThresholdIndex = args.indexOf("--skip-threshold");
    const skipThreshold =
      skipThresholdIndex !== -1 && args[skipThresholdIndex + 1]
        ? Number.parseInt(args[skipThresholdIndex + 1], 10)
        : 5000;

    if (skipThresholdIndex !== -1) {
      console.log(`スキップ閾値: ${skipThreshold}件`);
    }

    // 既存データの削除（必要な場合）
    if (prefectureCode) {
      console.log(`都道府県コード ${prefectureCode} の既存データを削除中...`);
      await deleteAdminBoundariesByPrefecture(prefectureCode);
    }

    // GeoJSONのインポート
    await importGeoJSONToDB(filePath, skipThreshold);

    // インポート後の重複チェック
    const shouldSkipCheck = args.includes("--no-check");
    if (!shouldSkipCheck) {
      console.log("\nインポート後の重複チェックを実行中...");
      await mergeAdminBoundaries();
    }

    console.log("インポートが完了しました！");
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

// スクリプトとして直接実行された場合
if (require.main === module) {
  main();
}

/**
 * 既存の行政区域データをチェックして重複を避ける
 */
async function getExistingBoundariesMap(
  supabase: ReturnType<typeof createClient<Database>>,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("admin_boundaries")
    .select("prefecture_name, city_name, district_name");

  if (error) {
    console.error("既存データの取得に失敗:", error);
    return new Set();
  }

  const existingSet = new Set<string>();
  for (const item of data) {
    // prefecture_name + city_name + district_name の組み合わせでキーを作成
    // NULL値は明示的に"NULL"として扱う
    const key = `${item.prefecture_name}-${item.city_name || "NULL"}-${item.district_name || "NULL"}`;
    existingSet.add(key);
  }

  console.log(`既存の行政区域: ${existingSet.size}件`);
  return existingSet;
}

/**
 * AdminBoundaryオブジェクトから重複チェック用のキーを生成
 */
function createBoundaryKey(boundary: AdminBoundaryInsert): string {
  return `${boundary.prefecture_name}-${boundary.city_name || "NULL"}-${boundary.district_name || "NULL"}`;
}

/**
 * 同じ行政区域の複数ポリゴンをマージする
 */
function mergePolygons(features: GeoJSONFeature[]): GeoJSONFeature {
  if (features.length === 1) {
    // 単一の場合はMultiPolygonに変換
    const feature = features[0];
    if (feature.geometry.type === "Polygon") {
      feature.geometry = {
        type: "MultiPolygon",
        coordinates: [feature.geometry.coordinates as number[][][]],
      };
    }
    return feature;
  }

  // 複数の場合はマージ
  const allCoordinates: number[][][][] = [];

  for (const feature of features) {
    if (feature.geometry.type === "Polygon") {
      allCoordinates.push(feature.geometry.coordinates as number[][][]);
    } else if (feature.geometry.type === "MultiPolygon") {
      allCoordinates.push(...(feature.geometry.coordinates as number[][][][]));
    }
  }

  // 最初のfeatureをベースにしてgeometryのみ更新
  const baseFeature = features[0];
  return {
    ...baseFeature,
    geometry: {
      type: "MultiPolygon",
      coordinates: allCoordinates,
    },
  };
}

/**
 * 大きなポリゴンを複数のバッチに分割して処理する
 */
async function processBigPolygonInBatches(
  features: GeoJSONFeature[],
  boundaryKey: string,
  supabase: ReturnType<typeof createClient<Database>>,
  skipThreshold: number,
): Promise<{ success: boolean; insertedCount: number }> {
  const MAX_BATCH_SIZE = 50; // 一度に処理するポリゴン数
  const totalFeatures = features.length;

  console.log(`🔄 大ポリゴン分割処理開始: ${boundaryKey} (${totalFeatures}件)`);

  // 分割処理用の一時的なadmin_boundary情報を取得
  const baseAdminBoundary = convertFeatureToAdminBoundary(features[0]);
  if (!baseAdminBoundary) {
    console.error(`❌ ベース情報の変換に失敗: ${boundaryKey}`);
    return { success: false, insertedCount: 0 };
  }

  const allCoordinates: number[][][][] = [];
  let processedCount = 0;

  // ポリゴンを分割して処理
  for (let i = 0; i < totalFeatures; i += MAX_BATCH_SIZE) {
    const batchFeatures = features.slice(i, i + MAX_BATCH_SIZE);

    console.log(
      `  バッチ ${Math.floor(i / MAX_BATCH_SIZE) + 1}/${Math.ceil(totalFeatures / MAX_BATCH_SIZE)}: ${batchFeatures.length}件処理中...`,
    );

    // バッチ内のポリゴンの座標を収集
    for (const feature of batchFeatures) {
      if (feature.geometry.type === "Polygon") {
        allCoordinates.push(feature.geometry.coordinates as number[][][]);
      } else if (feature.geometry.type === "MultiPolygon") {
        allCoordinates.push(
          ...(feature.geometry.coordinates as number[][][][]),
        );
      }
    }

    processedCount += batchFeatures.length;

    // バッチ間で少し待機（メモリとDB負荷軽減）
    if (i + MAX_BATCH_SIZE < totalFeatures) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  // 全ポリゴンをまとめてMultiPolygonとして挿入
  try {
    const finalAdminBoundary: AdminBoundaryInsert = {
      ...baseAdminBoundary,
      geometry: {
        type: "MultiPolygon",
        coordinates: allCoordinates,
      },
      is_merged: true,
      original_count: totalFeatures,
    };

    console.log(
      `  📝 最終挿入: ${boundaryKey} (${allCoordinates.length}個のポリゴン)`,
    );

    const { error } = await supabase
      .from("admin_boundaries")
      .insert([finalAdminBoundary]);

    if (error) {
      console.error(`❌ 大ポリゴン挿入エラー (${boundaryKey}):`, error.message);
      return { success: false, insertedCount: 0 };
    }

    console.log(`✅ 大ポリゴン挿入成功: ${boundaryKey}`);
    return { success: true, insertedCount: 1 };
  } catch (error) {
    console.error(`❌ 大ポリゴン処理エラー (${boundaryKey}):`, error);
    return { success: false, insertedCount: 0 };
  }
}
