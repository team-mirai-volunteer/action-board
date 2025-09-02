// Edge-compatible - removed Node.js file system imports
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
      from: `"チームはやま" <noreply@${MAILGUN_DOMAIN}>`,
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

// Welcome email template (inline for Edge Runtime compatibility)
const WELCOME_EMAIL_TEMPLATE = `<div style="
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 20px;
  font-size: 16px;
  line-height: 1.6;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, sans-serif;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
">

  <p style="text-align:center; margin-bottom: 28px;">
    <img src="https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/assets//logo.png" alt="チームはやまアクションボード"
      style="width:100px;height:83px;margin:0 auto;">
  </p>

  <h2 style="text-align:center; margin-bottom: 28px;">アクションボード登録完了！</h2>

  <p style="margin-bottom: 24px;">
    <strong>「チームはやま」アクションボード</strong>にご登録いただき、誠にありがとうございます。<br />
    アクションボードは、政治活動をもっと身近に感じながら、<strong>ゲーム感覚で楽しく参加</strong>できるプラットフォームです。<br />
    ぜひ活用して、チームはやまの活動に力を貸してください。
  </p>

  <p style="margin-bottom: 24px;">
    今後のイベントのご案内や、具体的なご依頼に関する重要な情報は、<strong>サポーター専用の公式LINE</strong>から発信しています。<br />
    まだご登録がお済みでない方は、ぜひこの機会にご登録ください。
  </p>

  <p style="text-align: center; margin-bottom: 28px;">
    <a href="https://line.me/R/ti/p/@579acemt"
       style="background-color:#00B900;border-radius:8px;color:#ffffff;display:inline-block;font-family:-apple-system, BlinkMacSystemFont, 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, sans-serif;font-size:14px;font-weight:bold;line-height:40px;text-align:center;text-decoration:none;width:180px;-webkit-text-size-adjust:none;">
      <span style="display:inline-block;vertical-align:middle;">公式LINEを友だち追加</span>
    </a>
  </p>

  <p style="margin-bottom: 24px;">
    サポーター公式LINEにご登録いただくと、<strong>サポーターガイド</strong>など活動に役立つ情報をまとめてお届けします。
  </p>

  <p style="margin-top: 32px;">引き続き、どうぞよろしくお願いいたします！</p>
  <p>チームはやま<br /><small>※このメールは送信専用です</small></p>

  <hr style="border-top:1px solid #eaeaea;margin:26px 0;width:100%;color:#eaeaea">

  <div style="font-size:12px;color:#666;margin-top:20px;">
    <p>チームはやまアクションボード<br />
      <a href="https://action.team-mir.ai/">https://action.team-mir.ai/</a>
    </p>

    <p>チームはやま公式サイト<br />
      <a href="https://team-mir.ai/">https://team-mir.ai/</a>
    </p>

    <p>© 2025 Team Mirai</p>
  </div>

</div>`;

export async function sendWelcomeMail(to: string) {
  const html = WELCOME_EMAIL_TEMPLATE;

  await sendMail({
    to,
    subject:
      "「チームはやま」アクションボードに登録いただきありがとうございます",
    html,
  });
}
