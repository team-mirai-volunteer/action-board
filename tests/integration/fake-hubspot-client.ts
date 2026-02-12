import type { HubSpotClient } from "@/features/user-settings/types/hubspot-client";

/**
 * テスト用のFake HubSpotクライアント
 *
 * 実際のHubSpot APIを呼ばず、常に成功を返す。
 * shouldFail を true にするとエラーを返す。
 */
export class FakeHubSpotClient implements HubSpotClient {
  public calls: Array<{
    contactData: { email: string; firstname: string; state: string };
    existingContactId: string | null;
  }> = [];

  constructor(private readonly shouldFail = false) {}

  async createOrUpdateContact(
    contactData: { email: string; firstname: string; state: string },
    existingContactId: string | null,
  ): Promise<
    { success: true; contactId: string } | { success: false; error: string }
  > {
    this.calls.push({ contactData, existingContactId });

    if (this.shouldFail) {
      return { success: false, error: "HubSpot API error (fake)" };
    }

    return {
      success: true,
      contactId: existingContactId ?? `fake-hubspot-${Date.now()}`,
    };
  }
}
