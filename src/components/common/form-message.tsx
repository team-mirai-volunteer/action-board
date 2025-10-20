import { EXTERNAL_LINKS } from "@/lib/constants/external-links";
import clsx from "clsx";

export type MessageType =
  | "success"
  | "error"
  | "message"
  | "signup-success"
  | "password-reset-success"
  | "login-error";

export type Message =
  | { success: string; html?: boolean }
  | { error: string; html?: boolean }
  | { message: string; html?: boolean }
  | { type: MessageType };

const getMessageContent = (type: MessageType) => {
  const faqLink = (
    <a
      href={EXTERNAL_LINKS.faq}
      target="_blank"
      rel="noopener noreferrer"
      className="text-teal-600 hover:text-teal-700 underline"
    >
      よくあるご質問 ↗
    </a>
  );

  switch (type) {
    case "signup-success":
      return (
        <div>
          ご登録頂きありがとうございます！
          <br />
          認証メールをお送りしました。
          <br />
          メールに記載のURLをクリックして、アカウントを有効化してください。
          <br />
          なお、迷惑メールフォルダに振り分けられている場合がありますので、そちらもあわせてご確認ください。
          <br />
          <br />
          会員登録でお困りの方は{faqLink}をご確認ください。
        </div>
      );
    case "password-reset-success":
      return (
        <div>
          パスワードリセット用のリンクをメールでお送りしました。
          <br />
          <br />
          パスワードリセットでお困りの方は{faqLink}をご確認ください。
        </div>
      );
    case "login-error":
      return (
        <div>
          メールアドレスまたはパスワードが間違っています
          <br />
          <br />
          ログインでお困りの方は{faqLink}をご確認ください。
        </div>
      );
    default:
      return null;
  }
};

export function FormMessage({
  className,
  message,
}: { className?: string; message: Message }) {
  if (!message) return null;

  // Type-based message handling
  if ("type" in message) {
    const content = getMessageContent(message.type);
    if (!content) return null;

    const isError = message.type === "login-error";
    const isSuccess =
      message.type === "signup-success" ||
      message.type === "password-reset-success";

    return (
      <div
        className={clsx(
          "relative flex items-start gap-3 w-full max-w-md mx-auto p-4 rounded-xl",
          "border text-card-foreground shadow-soft-lg",
          "sm:max-w-lg",
          {
            "bg-green-50 border-green-200": isSuccess,
            "bg-red-50 border-red-200": isError,
            "bg-blue-50 border-blue-200": !isSuccess && !isError,
          },
          className,
        )}
      >
        <div className="flex-1">
          <div
            className={clsx(
              "text-sm whitespace-pre-wrap leading-relaxed space-y-1",
              {
                "text-green-700": isSuccess,
                "text-red-700": isError,
                "text-blue-700": !isSuccess && !isError,
              },
            )}
          >
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Legacy string-based message handling
  if (!("success" in message || "error" in message || "message" in message)) {
    return null;
  }

  return (
    <div
      className={clsx(
        "relative flex items-start gap-3 w-full max-w-md mx-auto p-4 rounded-xl",
        "border text-card-foreground shadow-soft-lg",
        "sm:max-w-lg", // スマホよりも大きい画面では少し広く
        {
          "bg-green-50 border-green-200": "success" in message,
          "bg-red-50 border-red-200": "error" in message,
          "bg-blue-50 border-blue-200": "message" in message,
        },
        className,
      )}
    >
      {"success" in message && (
        <div className="flex-1">
          <div className="text-sm text-green-700 whitespace-pre-wrap leading-relaxed space-y-1">
            {message.html ? (
              <div
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Controlled HTML content for FAQ links
                dangerouslySetInnerHTML={{ __html: message.success }}
                className="[&_a]:inline-block [&_a]:break-words"
              />
            ) : (
              message.success
            )}
          </div>
        </div>
      )}
      {"error" in message && (
        <div className="flex-1">
          <div className="text-sm text-red-700 whitespace-pre-wrap leading-relaxed space-y-1">
            {message.html ? (
              <div
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Controlled HTML content for FAQ links
                dangerouslySetInnerHTML={{ __html: message.error }}
                className="[&_a]:inline-block [&_a]:break-words"
              />
            ) : (
              message.error
            )}
          </div>
        </div>
      )}
      {"message" in message && (
        <div className="flex-1">
          <div className="text-sm text-blue-700 whitespace-pre-wrap leading-relaxed space-y-1">
            {message.html ? (
              <div
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Controlled HTML content for FAQ links
                dangerouslySetInnerHTML={{ __html: message.message }}
                className="[&_a]:inline-block [&_a]:break-words"
              />
            ) : (
              message.message
            )}
          </div>
        </div>
      )}
    </div>
  );
}
