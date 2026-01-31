import path from "node:path";
import dotenv from "dotenv";
import { calculateAllBadges } from "@/features/user-badges-calculation/calculate-badges";

// .envファイルをロード（ローカル開発用）
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  console.log("Starting badge calculation...");
  console.log(`Execution time: ${new Date().toISOString()}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

  try {
    const result = await calculateAllBadges();

    if (result.success) {
      console.log("✅ Badge calculation completed successfully!");
      console.log("Results:", JSON.stringify(result.results, null, 2));

      const totalUpdated =
        result.results.all.updatedCount +
        result.results.daily.updatedCount +
        result.results.prefecture.updatedCount +
        result.results.mission.updatedCount;

      console.log(`Total badges updated: ${totalUpdated}`);

      // 成功時は正常終了
      process.exit(0);
    } else {
      console.error("❌ Badge calculation failed!");
      console.error("Results:", JSON.stringify(result.results, null, 2));

      // 失敗時はエラーコードで終了
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Unexpected error during badge calculation:", error);

    // エラー時はエラーコードで終了
    process.exit(1);
  }
}

// スクリプトを実行
main();
