/**
 * HubSpot API連携サービス
 * ユーザープロフィール更新時にHubSpotコンタクトを作成・更新する
 */

export interface HubSpotContactData {
  email: string;
  firstname?: string;
}

export interface HubSpotContact {
  id: string;
  properties: {
    email: string;
    firstname?: string;
  };
}

export interface HubSpotCreateContactResponse {
  id: string;
  properties: Record<string, string>;
}

export interface HubSpotError {
  status: string;
  message: string;
  correlationId?: string;
}

export interface HubSpotListMembershipResponse {
  added: string[];
  discarded: string[];
  invalidVids: string[];
  invalidEmails: string[];
}

/**
 * HubSpotコンタクトを作成または更新し、コンタクトリストに追加する
 */
export async function createOrUpdateHubSpotContact(
  contactData: HubSpotContactData,
  existingContactId?: string | null,
): Promise<
  { success: true; contactId: string } | { success: false; error: string }
> {
  const apiKey = process.env.HUBSPOT_API_KEY;
  const listId = process.env.HUBSPOT_CONTACT_LIST_ID;

  if (!apiKey) {
    console.error("HUBSPOT_API_KEY environment variable is not set");
    return { success: false, error: "HubSpot API key not configured" };
  }

  try {
    // 既存のコンタクトIDがある場合は更新、ない場合は作成
    let result:
      | { success: true; contactId: string }
      | { success: false; error: string };
    if (existingContactId) {
      result = await updateHubSpotContact(
        existingContactId,
        contactData,
        apiKey,
      );
    } else {
      result = await createHubSpotContact(contactData, apiKey);
    }

    // コンタクト作成/更新が成功し、リストIDが設定されている場合はリストに追加
    if (result.success && listId) {
      await addContactToList(result.contactId, listId, apiKey);
    }

    return result;
  } catch (error) {
    console.error("HubSpot API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * 新しいHubSpotコンタクトを作成する
 */
async function createHubSpotContact(
  contactData: HubSpotContactData,
  apiKey: string,
): Promise<
  { success: true; contactId: string } | { success: false; error: string }
> {
  const url = "https://api.hubapi.com/crm/v3/objects/contacts";

  const properties: Record<string, string> = {
    email: contactData.email,
    firstname: contactData.email, // firstnameにもemailを設定
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      properties,
    }),
  });

  if (!response.ok) {
    // エラーレスポンスの詳細を取得
    const errorBody = await response.text();
    console.error(`HubSpot API error (${response.status}):`, errorBody);

    // 重複エラー（409）の場合は、メールアドレスで既存コンタクトを検索して更新
    if (response.status === 409) {
      console.log(
        "Contact already exists, attempting to find and update existing contact",
      );
      return await findAndUpdateExistingContact(contactData, apiKey);
    }

    return {
      success: false,
      error: `HubSpot API error: ${response.status} ${response.statusText}`,
    };
  }

  const result: HubSpotCreateContactResponse = await response.json();
  console.log("HubSpot contact created successfully:", result.id);

  return { success: true, contactId: result.id };
}

/**
 * 既存のHubSpotコンタクトを更新する
 */
async function updateHubSpotContact(
  contactId: string,
  contactData: HubSpotContactData,
  apiKey: string,
): Promise<
  { success: true; contactId: string } | { success: false; error: string }
> {
  const url = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`;

  const properties: Record<string, string> = {
    firstname: contactData.email, // firstnameにemailを設定
  };

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      properties,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`HubSpot API update error (${response.status}):`, errorBody);
    return {
      success: false,
      error: `HubSpot API update error: ${response.status} ${response.statusText}`,
    };
  }

  console.log("HubSpot contact updated successfully:", contactId);
  return { success: true, contactId };
}

/**
 * メールアドレスで既存コンタクトを検索して更新する
 */
async function findAndUpdateExistingContact(
  contactData: HubSpotContactData,
  apiKey: string,
): Promise<
  { success: true; contactId: string } | { success: false; error: string }
> {
  // メールアドレスでコンタクトを検索
  const searchUrl = "https://api.hubapi.com/crm/v3/objects/contacts/search";

  const searchResponse = await fetch(searchUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: contactData.email,
            },
          ],
        },
      ],
      properties: ["email", "firstname"],
    }),
  });

  if (!searchResponse.ok) {
    const errorBody = await searchResponse.text();
    console.error(
      `HubSpot search error (${searchResponse.status}):`,
      errorBody,
    );
    return {
      success: false,
      error: `HubSpot search error: ${searchResponse.status} ${searchResponse.statusText}`,
    };
  }

  const searchResult = await searchResponse.json();

  if (searchResult.results && searchResult.results.length > 0) {
    const existingContact = searchResult.results[0];
    console.log("Found existing contact, updating:", existingContact.id);
    return await updateHubSpotContact(existingContact.id, contactData, apiKey);
  }
  console.error("Contact not found after duplicate error");
  return {
    success: false,
    error: "Contact creation failed and existing contact not found",
  };
}

/**
 * HubSpotコンタクトをリストに追加する
 */
export async function addContactToList(
  contactId: string,
  listId: string,
  apiKey: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const url = `https://api.hubapi.com/crm/v3/lists/${listId}/memberships/add`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify([contactId]),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `HubSpot list membership error (${response.status}):`,
      errorBody,
    );
    return {
      success: false,
      error: `HubSpot list membership error: ${response.status} ${response.statusText}`,
    };
  }

  const result: HubSpotListMembershipResponse = await response.json();
  console.log("HubSpot contact added to list successfully:", {
    contactId,
    listId,
    added: result.added,
  });

  return { success: true };
}
