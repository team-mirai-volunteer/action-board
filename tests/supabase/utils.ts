import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/supabase";

// 環境変数の設定が必要
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  console.error("必要な環境変数が設定されていません");
  process.exit(1);
}

// サービスロールクライアント（RLSをバイパスする管理者権限）
export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

// テストユーザーの情報
export type TestUser = {
  email: string;
  password: string;
  userId: string;
};

/**
 * テストユーザーを作成し、認証情報を持つクライアントを返す
 */
export async function createTestUser(
  email = `test-${Date.now()}@example.com`,
  password = "password123",
): Promise<{
  user: TestUser;
  client: ReturnType<typeof createClient<Database>>;
}> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URLが設定されていません");
  }

  // ユーザーを作成
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    throw new Error(
      `テストユーザーの作成に失敗しました: ${authError?.message}`,
    );
  }

  const authId = authData.user.id;

  // private_usersテーブルにデータを挿入（管理者権限で）
  const { error: insertError } = await adminClient
    .from("private_users")
    .insert({
      id: authId,
      date_of_birth: "1990-12-01",
      postcode: "1000001",
    });

  if (insertError) {
    throw new Error(
      `private_usersへのデータ挿入に失敗しました: ${insertError.message}`,
    );
  }

  // public_user_profilesテーブルにデータを挿入（管理者権限で）
  const { error: insertProfileError } = await adminClient
    .from("public_user_profiles")
    .insert({
      id: authId,
      name: "テストユーザー",
      address_prefecture: "東京都",
    });

  if (insertProfileError) {
    throw new Error(
      `public_user_profilesへのデータ挿入に失敗しました: ${insertProfileError.message}`,
    );
  }

  // 認証情報を持つクライアントを作成
  const { data: sessionData, error: sessionError } =
    await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  if (sessionError || !sessionData.properties?.hashed_token) {
    throw new Error(`セッション生成に失敗しました: ${sessionError?.message}`);
  }

  // ログインしたクライアントを生成
  const userClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const { error: signInError } = await userClient.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    throw new Error(`サインインに失敗しました: ${signInError.message}`);
  }

  return {
    user: {
      email,
      password,
      userId: authId,
    },
    client: userClient,
  };
}

/**
 * テストユーザーをクリーンアップ
 */
export async function cleanupTestUser(authId: string): Promise<void> {
  // public_user_profilesからユーザーを削除
  const { data } = await adminClient
    .from("private_users")
    .select("id")
    .eq("id", authId)
    .single();

  if (!data) {
    console.error(`ユーザーが見つかりません: authId=${authId}`);
    return;
  }

  await adminClient.from("public_user_profiles").delete().eq("id", data?.id);

  // private_usersからユーザーを削除
  await adminClient.from("private_users").delete().eq("id", authId);

  // Auth ユーザーを削除
  await adminClient.auth.admin.deleteUser(authId);
}

/**
 * 匿名ユーザー用のクライアントを取得
 */
export function getAnonClient(): ReturnType<typeof createClient<Database>> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URLが設定されていません");
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
