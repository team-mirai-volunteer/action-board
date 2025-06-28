import fs from "node:fs/promises";
import path from "node:path";
import formData from "form-data";
import Mailgun from "mailgun.js";

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN: string = process.env.MAILGUN_DOMAIN ?? "";

if (!MAILGUN_API_KEY) {
  throw new Error("MAILGUN_API_KEY is not set");
}
if (!MAILGUN_DOMAIN) {
  throw new Error("MAILGUN_DOMAIN is not set");
}

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: MAILGUN_API_KEY,
  url: process.env.MAILGUN_API_BASE_URL || "https://api.mailgun.net",
});

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await mg.messages
    .create(MAILGUN_DOMAIN, {
      from: `"チームみらい" <noreply@${MAILGUN_DOMAIN}>`,
      to,
      subject,
      html,
    })
    .then((msg) => {
      console.log("Mailgun response:", msg);
    })
    .catch((err) => {
      console.error("Mailgun error:", err);
      throw err;
    });
}

export async function sendWelcomeMail(to: string) {
  const html = "";
  try {
    const templatePath = path.join(
      process.cwd(),
      process.env.EMAIL_TEMPLATE_DIR || "supabase/templates",
      "welcome.html",
    );
    const html = await fs.readFile(templatePath, "utf8");
  } catch (error) {
    console.error(
      "ウェルカムメールテンプレートの読み込みに失敗しました:",
      error,
    );
    throw new Error("メールテンプレートが見つかりません");
  }

  await sendMail({
    to,
    subject:
      "「チームみらい」アクションボードに登録いただきありがとうございます",
    html,
  });
}
