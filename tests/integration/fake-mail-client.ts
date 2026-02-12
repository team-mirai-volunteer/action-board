import type { MailClient } from "@/features/user-settings/types/mail-client";

/**
 * テスト用のFakeメールクライアント
 *
 * 実際のメール送信を行わず、送信先を記録する。
 * shouldFail を true にするとエラーを投げる。
 */
export class FakeMailClient implements MailClient {
  public sentTo: string[] = [];

  constructor(private readonly shouldFail = false) {}

  async sendWelcomeMail(to: string): Promise<void> {
    this.sentTo.push(to);

    if (this.shouldFail) {
      throw new Error("Mail send failed (fake)");
    }
  }
}
