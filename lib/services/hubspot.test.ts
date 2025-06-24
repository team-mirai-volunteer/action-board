import {
  type HubSpotContactData,
  addContactToList,
  createOrUpdateHubSpotContact,
} from "./hubspot";

Object.defineProperty(global, "fetch", {
  value: jest.fn(),
  writable: true,
});
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("hubspot service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    mockFetch.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("createOrUpdateHubSpotContact", () => {
    const mockContactData: HubSpotContactData = {
      email: "test@example.com",
      firstname: "テスト",
    };

    it("新規コンタクトを正常に作成する", async () => {
      process.env.HUBSPOT_API_KEY = "test-api-key";
      process.env.HUBSPOT_CONTACT_LIST_ID = "test-list-id";

      const mockCreateResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: "contact-123",
          properties: { email: "test@example.com" },
        }),
      };

      const mockListResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          added: ["contact-123"],
          discarded: [],
          invalidVids: [],
          invalidEmails: [],
        }),
      };

      mockFetch
        .mockResolvedValueOnce(mockCreateResponse as any)
        .mockResolvedValueOnce(mockListResponse as any);

      const result = await createOrUpdateHubSpotContact(mockContactData);

      expect(result).toEqual({ success: true, contactId: "contact-123" });
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "https://api.hubapi.com/crm/v3/objects/contacts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          },
          body: JSON.stringify({
            properties: {
              email: "test@example.com",
              firstname: "test@example.com",
            },
          }),
        },
      );
    });

    it("既存コンタクトを正常に更新する", async () => {
      process.env.HUBSPOT_API_KEY = "test-api-key";

      const mockUpdateResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };

      mockFetch.mockResolvedValueOnce(mockUpdateResponse as any);

      const result = await createOrUpdateHubSpotContact(
        mockContactData,
        "existing-contact-123",
      );

      expect(result).toEqual({
        success: true,
        contactId: "existing-contact-123",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.hubapi.com/crm/v3/objects/contacts/existing-contact-123",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          },
          body: JSON.stringify({
            properties: {
              firstname: "test@example.com",
            },
          }),
        },
      );
    });

    it("API keyが設定されていない場合はエラーを返す", async () => {
      process.env.HUBSPOT_API_KEY = undefined;

      const result = await createOrUpdateHubSpotContact(mockContactData);

      expect(result).toEqual({
        success: false,
        error: "HubSpot API key not configured",
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("重複エラー（409）の場合は既存コンタクトを検索して更新する", async () => {
      process.env.HUBSPOT_API_KEY = "test-api-key";

      const mockCreateResponse = {
        ok: false,
        status: 409,
        statusText: "Conflict",
        text: jest.fn().mockResolvedValue("Contact already exists"),
      };

      const mockSearchResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          results: [{ id: "existing-contact-456" }],
        }),
      };

      const mockUpdateResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };

      mockFetch
        .mockResolvedValueOnce(mockCreateResponse as any)
        .mockResolvedValueOnce(mockSearchResponse as any)
        .mockResolvedValueOnce(mockUpdateResponse as any);

      const result = await createOrUpdateHubSpotContact(mockContactData);

      expect(result).toEqual({
        success: true,
        contactId: "existing-contact-456",
      });
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("作成エラーが発生した場合はエラーを返す", async () => {
      process.env.HUBSPOT_API_KEY = "test-api-key";

      const mockCreateResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: jest.fn().mockResolvedValue("Invalid request"),
      };

      mockFetch.mockResolvedValueOnce(mockCreateResponse as any);

      const result = await createOrUpdateHubSpotContact(mockContactData);

      expect(result).toEqual({
        success: false,
        error: "HubSpot API error: 400 Bad Request",
      });
    });

    it("更新エラーが発生した場合はエラーを返す", async () => {
      process.env.HUBSPOT_API_KEY = "test-api-key";

      const mockUpdateResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: jest.fn().mockResolvedValue("Contact not found"),
      };

      mockFetch.mockResolvedValueOnce(mockUpdateResponse as any);

      const result = await createOrUpdateHubSpotContact(
        mockContactData,
        "non-existent-contact",
      );

      expect(result).toEqual({
        success: false,
        error: "HubSpot API update error: 404 Not Found",
      });
    });

    it("予期しないエラーが発生した場合はエラーを返す", async () => {
      process.env.HUBSPOT_API_KEY = "test-api-key";

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await createOrUpdateHubSpotContact(mockContactData);

      expect(result).toEqual({
        success: false,
        error: "Network error",
      });
    });
  });

  describe("addContactToList", () => {
    it("コンタクトをリストに正常に追加する", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          added: ["contact-123"],
          discarded: [],
          invalidVids: [],
          invalidEmails: [],
        }),
      };

      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await addContactToList(
        "contact-123",
        "list-456",
        "test-api-key",
      );

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.hubapi.com/crm/v3/lists/list-456/memberships/add",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          },
          body: JSON.stringify(["contact-123"]),
        },
      );
    });

    it("リスト追加エラーが発生した場合はエラーを返す", async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: jest.fn().mockResolvedValue("Invalid list ID"),
      };

      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await addContactToList(
        "contact-123",
        "invalid-list",
        "test-api-key",
      );

      expect(result).toEqual({
        success: false,
        error: "HubSpot list membership error: 400 Bad Request",
      });
    });
  });
});
