const fs = require("node:fs");
const { randomUUID } = require("node:crypto");

const now = new Date();
const jstOffset = 9 * 60 * 60 * 1000; // JST = UTC + 9時間
const jstNow = new Date(now.getTime() + jstOffset);

function getJSTDate(daysOffset = 0) {
  const date = new Date(jstNow);
  date.setDate(date.getDate() + daysOffset);
  return new Date(date.getTime() - jstOffset);
}

const today = getJSTDate(0);
const yesterday = getJSTDate(-1);
const dayBeforeYesterday = getJSTDate(-2);

console.log(`生成日時: ${jstNow.toISOString()} (JST)`);
console.log(`今日のUTC: ${today.toISOString()}`);
console.log(`昨日のUTC: ${yesterday.toISOString()}`);
console.log(`一昨日のUTC: ${dayBeforeYesterday.toISOString()}`);

const missionIds = [
  "e2898d7e-903f-4f9a-8b1b-93f783c9afac",
  "4446205f-933f-4a86-83af-dbf6bb6cde92",
  "e5348472-d054-4ef4-81af-772c6323b669",
  "17ea2e6e-9ccf-4d2d-a3b4-f34d1a612439",
  "27ea2e6e-9ccf-4d2d-a3b4-f34d1a612440",
  "37ea2e6e-9ccf-4d2d-a3b4-f34d1a612441",
];

const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

const lastNames = [
  "佐藤",
  "鈴木",
  "高橋",
  "田中",
  "渡辺",
  "伊藤",
  "山本",
  "中村",
  "小林",
  "加藤",
  "吉田",
  "山田",
  "佐々木",
  "山口",
  "松本",
  "井上",
  "木村",
  "林",
  "斎藤",
  "清水",
  "山崎",
  "森",
  "池田",
  "橋本",
  "阿部",
  "石川",
  "山下",
  "中島",
  "新井",
  "福田",
  "太田",
  "西田",
  "藤田",
  "岡田",
  "長谷川",
  "村上",
  "近藤",
  "石井",
  "斉藤",
  "坂本",
];

const firstNames = [
  "太郎",
  "次郎",
  "三郎",
  "四郎",
  "五郎",
  "花子",
  "美咲",
  "愛",
  "翔",
  "蓮",
  "陽菜",
  "結愛",
  "咲良",
  "陽翔",
  "樹",
  "悠人",
  "大翔",
  "颯真",
  "朝陽",
  "奏太",
  "美月",
  "心春",
  "結月",
  "莉子",
  "美桜",
  "結衣",
  "心愛",
  "杏",
  "さくら",
  "美羽",
];

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomTimeInDay(baseDate) {
  const date = new Date(baseDate);
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  date.setSeconds(Math.floor(Math.random() * 60));
  return date;
}

function randomXP() {
  return Math.floor(Math.random() * 191) + 10; // 10-200
}

function generateUsers() {
  const users = [];
  const userProfiles = [];
  const userLevels = [];

  for (let i = 0; i < 200; i++) {
    const userId = randomUUID();
    const lastName = randomChoice(lastNames);
    const firstName = randomChoice(firstNames);
    const fullName = `${lastName}${firstName}`;
    const prefecture = randomChoice(prefectures);
    const birthYear = 1970 + Math.floor(Math.random() * 40); // 1970-2009
    const birthDate = `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`;
    const username = `user${String(i + 1).padStart(3, "0")}`;

    users.push({
      id: userId,
      email: `${username}@example.com`,
      encrypted_password:
        "$2a$10$dummy.encrypted.password.hash.for.testing.purposes.only",
      email_confirmed_at: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });

    userProfiles.push({
      id: userId,
      display_name: fullName,
      prefecture: prefecture,
      birth_date: birthDate,
      username: username,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });

    const initialXP = Math.floor(Math.random() * 1001);
    userLevels.push({
      user_id: userId,
      xp_amount: initialXP,
      level: Math.floor(initialXP / 100) + 1, // 100XPごとにレベルアップ
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });
  }

  return { users, userProfiles, userLevels };
}

function generateAchievements(users) {
  const achievements = [];
  const xpTransactions = [];

  const todayCount = Math.floor(10000 * 0.5); // 5,000件
  const yesterdayCount = Math.floor(10000 * 0.3); // 3,000件
  const dayBeforeCount = 10000 - todayCount - yesterdayCount; // 2,000件

  console.log(
    `実績データ配分: 今日=${todayCount}件, 昨日=${yesterdayCount}件, 一昨日=${dayBeforeCount}件`,
  );

  const achievementIndex = 0;

  for (let i = 0; i < todayCount; i++) {
    const achievementId = randomUUID();
    const transactionId = randomUUID();
    const userId = randomChoice(users).id;
    const missionId = randomChoice(missionIds);
    const createdAt = randomTimeInDay(today);
    const xpAmount = randomXP();

    achievements.push({
      id: achievementId,
      mission_id: missionId,
      user_id: userId,
      created_at: createdAt.toISOString(),
    });

    xpTransactions.push({
      id: transactionId,
      user_id: userId,
      xp_amount: xpAmount,
      source_type: "MISSION_COMPLETION",
      source_id: achievementId,
      created_at: createdAt.toISOString(),
    });
  }

  for (let i = 0; i < yesterdayCount; i++) {
    const achievementId = randomUUID();
    const transactionId = randomUUID();
    const userId = randomChoice(users).id;
    const missionId = randomChoice(missionIds);
    const createdAt = randomTimeInDay(yesterday);
    const xpAmount = randomXP();

    achievements.push({
      id: achievementId,
      mission_id: missionId,
      user_id: userId,
      created_at: createdAt.toISOString(),
    });

    xpTransactions.push({
      id: transactionId,
      user_id: userId,
      xp_amount: xpAmount,
      source_type: "MISSION_COMPLETION",
      source_id: achievementId,
      created_at: createdAt.toISOString(),
    });
  }

  for (let i = 0; i < dayBeforeCount; i++) {
    const achievementId = randomUUID();
    const transactionId = randomUUID();
    const userId = randomChoice(users).id;
    const missionId = randomChoice(missionIds);
    const createdAt = randomTimeInDay(dayBeforeYesterday);
    const xpAmount = randomXP();

    achievements.push({
      id: achievementId,
      mission_id: missionId,
      user_id: userId,
      created_at: createdAt.toISOString(),
    });

    xpTransactions.push({
      id: transactionId,
      user_id: userId,
      xp_amount: xpAmount,
      source_type: "MISSION_COMPLETION",
      source_id: achievementId,
      created_at: createdAt.toISOString(),
    });
  }

  return { achievements, xpTransactions };
}

function generateSQL() {
  console.log("大規模テストデータを生成中...");

  const { users, userProfiles, userLevels } = generateUsers();
  const { achievements, xpTransactions } = generateAchievements(users);

  let sql = `-- 大規模テストデータ（動的生成）
-- 生成日時: ${jstNow.toISOString()} (JST)
-- ユーザー数: ${users.length}人
-- 実績データ数: ${achievements.length}件
-- 今日のデータ: ${achievements.filter((a) => a.created_at.startsWith(today.toISOString().split("T")[0])).length}件
-- 昨日のデータ: ${achievements.filter((a) => a.created_at.startsWith(yesterday.toISOString().split("T")[0])).length}件
-- 一昨日のデータ: ${achievements.filter((a) => a.created_at.startsWith(dayBeforeYesterday.toISOString().split("T")[0])).length}件

-- auth.usersテーブルへのデータ挿入
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) VALUES\n`;

  users.forEach((user, index) => {
    sql += `  ('${user.id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '${user.email}', '${user.encrypted_password}', '${user.email_confirmed_at}', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '${user.created_at}', '${user.updated_at}', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false)`;
    sql += index < users.length - 1 ? ",\n" : ";\n\n";
  });

  sql += `-- public_user_profilesテーブルへのデータ挿入
INSERT INTO public_user_profiles (id, display_name, prefecture, birth_date, username, created_at, updated_at) VALUES\n`;

  userProfiles.forEach((profile, index) => {
    sql += `  ('${profile.id}', '${profile.display_name}', '${profile.prefecture}', '${profile.birth_date}', '${profile.username}', '${profile.created_at}', '${profile.updated_at}')`;
    sql += index < userProfiles.length - 1 ? ",\n" : ";\n\n";
  });

  sql += `-- user_levelsテーブルへのデータ挿入
INSERT INTO user_levels (user_id, xp_amount, level, created_at, updated_at) VALUES\n`;

  userLevels.forEach((level, index) => {
    sql += `  ('${level.user_id}', ${level.xp_amount}, ${level.level}, '${level.created_at}', '${level.updated_at}')`;
    sql += index < userLevels.length - 1 ? ",\n" : ";\n\n";
  });

  sql += `-- achievementsテーブルへのデータ挿入（${achievements.length}件）
INSERT INTO achievements (id, mission_id, user_id, created_at) VALUES\n`;

  achievements.forEach((achievement, index) => {
    sql += `  ('${achievement.id}', '${achievement.mission_id}', '${achievement.user_id}', '${achievement.created_at}')`;
    sql += index < achievements.length - 1 ? ",\n" : ";\n\n";
  });

  sql += `-- xp_transactionsテーブルへのデータ挿入（${xpTransactions.length}件）
INSERT INTO xp_transactions (id, user_id, xp_amount, source_type, source_id, created_at) VALUES\n`;

  xpTransactions.forEach((transaction, index) => {
    sql += `  ('${transaction.id}', '${transaction.user_id}', ${transaction.xp_amount}, '${transaction.source_type}', '${transaction.source_id}', '${transaction.created_at}')`;
    sql += index < xpTransactions.length - 1 ? ",\n" : ";\n\n";
  });

  return sql;
}

const sqlContent = generateSQL();
fs.writeFileSync(
  "/home/ubuntu/repos/action-board/scripts/large-seed-data.sql",
  sqlContent,
);

console.log("大規模テストデータの生成が完了しました！");
console.log(
  "ファイル: /home/ubuntu/repos/action-board/scripts/large-seed-data.sql",
);
console.log(
  `総サイズ: ${Math.round((sqlContent.length / 1024 / 1024) * 100) / 100} MB`,
);
