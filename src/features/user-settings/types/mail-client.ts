/**
 * メール送信クライアントのインターフェース（ポート）
 *
 * メール送信APIとの通信を抽象化する。
 * テスト時にはFake実装に差し替え可能。
 */
export interface MailClient {
  sendWelcomeMail(to: string): Promise<void>;
}
