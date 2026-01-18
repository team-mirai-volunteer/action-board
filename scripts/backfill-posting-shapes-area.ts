/**
 * 既存のposting_shapesデータにarea_m2を計算して保存するバックフィルスクリプト
 *
 * 使用方法:
 *   npx tsx scripts/backfill-posting-shapes-area.ts
 *
 * ドライラン（変更を保存しない）:
 *   npx tsx scripts/backfill-posting-shapes-area.ts --dry-run
 */

import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { area } from "@turf/area";
import { polygon } from "@turf/helpers";
import dotenv from "dotenv";

// .envファイルをロード（ローカル開発用）
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// 環境変数から接続情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

interface PostingShape {
  id: string;
  type: string;
  coordinates: unknown;
  area_m2: number | null;
}

/**
 * ポリゴンの面積を計算（平方メートル）
 */
function calculatePolygonArea(coordinates: unknown): number | null {
  try {
    const geojson = coordinates as GeoJSONPolygon;

    if (
      geojson.type !== "Polygon" ||
      !geojson.coordinates ||
      !geojson.coordinates[0]
    ) {
      return null;
    }

    const poly = polygon(geojson.coordinates);
    return area(poly); // m²
  } catch (error) {
    console.error("Failed to calculate polygon area:", error);
    return null;
  }
}

async function backfillPostingShapesArea(dryRun: boolean) {
  console.log("\n=== Backfill posting_shapes area_m2 ===");
  console.log(
    `Mode: ${dryRun ? "DRY RUN (no changes will be saved)" : "LIVE"}`,
  );
  console.log("");

  // area_m2がnullのポリゴンを取得
  const { data: shapes, error: fetchError } = await supabase
    .from("posting_shapes")
    .select("id, type, coordinates, area_m2")
    .eq("type", "polygon")
    .is("area_m2", null);

  if (fetchError) {
    console.error("Error fetching shapes:", fetchError);
    process.exit(1);
  }

  if (!shapes || shapes.length === 0) {
    console.log("No shapes need area calculation. All done!");
    return;
  }

  console.log(`Found ${shapes.length} shapes without area_m2\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const shape of shapes as PostingShape[]) {
    const areaM2 = calculatePolygonArea(shape.coordinates);

    if (areaM2 === null) {
      console.log(`[SKIP] Shape ${shape.id}: Could not calculate area`);
      skippedCount++;
      continue;
    }

    const areaKm2 = areaM2 / 1_000_000;
    console.log(
      `[${dryRun ? "DRY" : "UPDATE"}] Shape ${shape.id}: ${areaM2.toFixed(2)} m² (${areaKm2.toFixed(4)} km²)`,
    );

    if (!dryRun) {
      const { error: updateError } = await supabase
        .from("posting_shapes")
        .update({ area_m2: areaM2 })
        .eq("id", shape.id);

      if (updateError) {
        console.error(`  Error updating shape ${shape.id}:`, updateError);
        errorCount++;
      } else {
        successCount++;
      }
    } else {
      successCount++;
    }
  }

  console.log("");
  console.log("=== Summary ===");
  console.log(`Total shapes processed: ${shapes.length}`);
  console.log(
    `Successfully ${dryRun ? "calculated" : "updated"}: ${successCount}`,
  );
  console.log(`Skipped (calculation failed): ${skippedCount}`);
  if (!dryRun) {
    console.log(`Errors: ${errorCount}`);
  }
  console.log("");
}

// メイン実行
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

backfillPostingShapesArea(dryRun)
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
