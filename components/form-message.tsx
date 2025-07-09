import clsx from "clsx";
import { CheckCircle, Info, XCircle } from "lucide-react";

export type Message =
  | { success: string; html?: boolean }
  | { error: string; html?: boolean }
  | { message: string; html?: boolean };

export function FormMessage({
  className,
  message,
}: { className?: string; message: Message }) {
  if (
    !message ||
    !("success" in message || "error" in message || "message" in message)
  )
    return null;

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
