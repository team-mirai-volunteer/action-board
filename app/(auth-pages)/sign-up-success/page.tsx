import { FormMessage } from "@/components/form-message";
import Image from "next/image";

export default function SignUpSuccess() {
  return (
    <div className="flex-1 flex flex-col min-w-72 max-w-lg mx-auto px-4">
      <div className="flex justify-center items-center m-4">
        <Image src="/img/logo.png" alt="logo" width={114} height={96} />
      </div>
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-medium text-center mb-2">
          アカウント作成完了
        </h1>
        <FormMessage
          message={{
            success:
              "ご登録頂きありがとうございます！\n" +
              "認証メールをお送りしました。\n" +
              "メールに記載のURLをクリックして、アカウントを有効化してください。\n" +
              "なお、迷惑メールフォルダに振り分けられている場合がありますので、そちらもあわせてご確認ください。\n\n" +
              '会員登録でお困りの方は<a href="https://team-mirai.notion.site/228f6f56bae18037957dd5f108d00e2f" target="_blank" rel="noopener noreferrer" style="color: #0d9488; text-decoration: underline;">よくあるご質問 ↗</a>をご確認ください。',
            html: true,
          }}
          className="mt-8"
        />
      </div>
    </div>
  );
}
