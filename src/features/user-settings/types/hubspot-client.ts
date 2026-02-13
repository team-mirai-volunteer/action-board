/**
 * HubSpot連携クライアントのインターフェース（ポート）
 *
 * HubSpot APIとの通信を抽象化する。
 * テスト時にはFake実装に差し替え可能。
 */
export interface HubSpotClient {
  createOrUpdateContact(
    contactData: { email: string; firstname: string; state: string },
    existingContactId: string | null,
  ): Promise<
    { success: true; contactId: string } | { success: false; error: string }
  >;
}
