import { execSync } from "node:child_process";

// Check if Supabase is running
export function checkSupabaseStatus(): boolean {
  try {
    // Check if docker is running first
    execSync("docker info", { stdio: "ignore" });
  } catch (error) {
    console.error("❌ Docker is not running. Please start Docker first.");
    return false;
  }

  try {
    // Check Supabase status
    const result = execSync("supabase status", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    // Debug: log the result to understand what we're getting
    // console.log("Supabase status output:", result);

    // Check if the output contains indicators that services are running
    // Look for the DB URL which indicates services are available
    if (result.includes("DB URL") && result.includes("postgresql://")) {
      return true;
    }

    return false;
  } catch (error) {
    // console.error("Error checking supabase status:", error);
    return false;
  }
}

// Main check function with helpful error messages
export async function ensureSupabaseRunning(): Promise<boolean> {
  console.log("🔍 Checking Supabase status...");

  if (!checkSupabaseStatus()) {
    console.error("\n❌ Supabase is not running!");
    console.error("\n📝 To start Supabase, run:");
    console.error("   supabase start\n");
    console.error(
      "This command will start the local Supabase environment needed for database operations.\n",
    );
    return false;
  }

  console.log("✅ Supabase is running\n");
  return true;
}

// Run if called directly
if (require.main === module) {
  ensureSupabaseRunning().then((running) => {
    process.exit(running ? 0 : 1);
  });
}
