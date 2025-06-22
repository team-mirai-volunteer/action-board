import fs from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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
  await transporter.sendMail({
    from: `"${process.env.SMTP_SENDER_NAME}" <${process.env.SMTP_ADMIN_EMAIL}>`,
    to,
    subject,
    html,
  });
}

export async function sendWelcomeMail(to: string) {
  const templatePath = path.join(
    process.cwd(),
    "supabase/templates/welcome.html",
  );
  const html = await fs.readFile(templatePath, "utf8");

  console.log(`Sending welcome email to: ${to}`);

  await sendMail({
    to,
    subject:
      "「チームみらい」アクションボードに登録いただきありがとうございます",
    html,
  });
}
