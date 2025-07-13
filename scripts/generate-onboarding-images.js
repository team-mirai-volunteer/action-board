const { createCanvas, registerFont } = require("canvas");
const fs = require("node:fs");
const path = require("node:path");

// 吹き出しデザインを含む背景画像の生成（テキストなし）
function generateOnboardingBackground() {
  const canvas = createCanvas(800, 1200);
  const ctx = canvas.getContext("2d");

  // 緑のグラデーション背景
  const gradient = ctx.createLinearGradient(0, 0, 0, 1200);
  gradient.addColorStop(0, "#A8E6CF");
  gradient.addColorStop(1, "#7FCDCD");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 1200);

  // 白い吹き出しエリア（上部）- テキストは含めない
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(50, 100, 700, 350, 30);
  ctx.fill();

  // 吹き出しの三角形
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(350, 450);
  ctx.lineTo(400, 500);
  ctx.lineTo(450, 450);
  ctx.closePath();
  ctx.fill();

  // おじいちゃんキャラクター（中央下部）
  const charX = 400;
  const charY = 900;

  // 体（緑の着物）
  ctx.fillStyle = "#5B9A8B";
  ctx.fillRect(charX - 80, charY - 50, 160, 180);

  // 頭（肌色）
  ctx.fillStyle = "#F4C2A1";
  ctx.beginPath();
  ctx.arc(charX, charY - 150, 80, 0, Math.PI * 2);
  ctx.fill();

  // 白いひげ
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(charX, charY - 120, 50, 0, Math.PI);
  ctx.fill();

  // 目
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(charX - 25, charY - 160, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(charX + 25, charY - 160, 8, 0, Math.PI * 2);
  ctx.fill();

  // 白い髪
  ctx.fillStyle = "#F0F0F0";
  ctx.beginPath();
  ctx.arc(charX, charY - 180, 60, 0, Math.PI);
  ctx.fill();

  // 足
  ctx.fillStyle = "#D4B8A3";
  ctx.fillRect(charX - 60, charY + 130, 40, 60);
  ctx.fillRect(charX + 20, charY + 130, 40, 60);

  // 草履
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(charX - 70, charY + 180, 50, 20);
  ctx.fillRect(charX + 10, charY + 180, 50, 20);

  // 画像を保存
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(outputDir, "onboarding-background.png"), buffer);
  console.log("Generated: onboarding-background.png");
}

// キャンバスのサイズ
const width = 800;
const height = 400;

// 出力ディレクトリ
const outputDir = path.join(__dirname, "../public/images/onboarding");

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// スライド画像の生成（既存のものはそのまま残す）

// 背景画像の生成（青いグラデーション）
function generateBackground() {
  const canvas = createCanvas(800, 1200);
  const ctx = canvas.getContext("2d");

  // グラデーション背景
  const gradient = ctx.createLinearGradient(0, 0, 0, 1200);
  gradient.addColorStop(0, "#E8F5FF");
  gradient.addColorStop(1, "#D1ECFF");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 1200);

  // 装飾的な円形
  ctx.fillStyle = "rgba(74, 144, 226, 0.1)";
  ctx.beginPath();
  ctx.arc(650, 100, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(150, 300, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(700, 950, 40, 0, Math.PI * 2);
  ctx.fill();

  // アイコン的な要素
  ctx.fillStyle = "#4A90E2";

  // ミッション的なアイコン
  ctx.beginPath();
  ctx.arc(600, 80, 20, 0, Math.PI * 2);
  ctx.fill();

  // バッジ的なアイコン
  ctx.beginPath();
  ctx.moveTo(120, 280);
  ctx.lineTo(140, 300);
  ctx.lineTo(160, 280);
  ctx.lineTo(150, 260);
  ctx.lineTo(130, 260);
  ctx.closePath();
  ctx.fill();

  // 画像を保存
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(outputDir, "background.png"), buffer);
  console.log("Generated: background.png");
}

// 新しいオンボーディング背景画像を生成
generateOnboardingBackground();
// 青いグラデーション背景画像も生成
generateBackground();

console.log("All onboarding images have been generated!");
