import { createClient } from "@/lib/supabase/client";
import type { PinData, UpdatePinRequest } from "@/lib/types/poster-map";

const supabase = createClient();

export async function getBoardPins(prefecture: string): Promise<PinData[]> {
  try {
    const mockPins: PinData[] = [
      {
        id: "1",
        place_name: "渋谷駅前掲示板",
        address: "東京都渋谷区道玄坂1-1-1",
        number: "TK-001",
        lat: 35.658,
        long: 139.7016,
        status: 0,
        note: "設置予定地",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        place_name: "新宿南口掲示板",
        address: "東京都新宿区新宿3-38-1",
        number: "TK-002",
        lat: 35.6896,
        long: 139.7006,
        status: 1,
        note: "設置完了",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "3",
        place_name: "池袋東口掲示板",
        address: "東京都豊島区南池袋1-28-1",
        number: "TK-003",
        lat: 35.7295,
        long: 139.7109,
        status: 2,
        note: "要修理",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "4",
        place_name: "品川駅港南口掲示板",
        address: "東京都港区港南2-16-3",
        number: "TK-004",
        lat: 35.6284,
        long: 139.7387,
        status: 4,
        note: "確認が必要",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "5",
        place_name: "上野駅公園口掲示板",
        address: "東京都台東区上野7-1-1",
        number: "TK-005",
        lat: 35.7141,
        long: 139.7774,
        status: 5,
        note: "修理対応中",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const filteredPins = mockPins.filter((pin) => {
      if (prefecture === "東京都") return true;
      if (prefecture === "大阪府") return pin.id === "2";
      if (prefecture === "神奈川県") return pin.id === "3";
      return false;
    });

    return filteredPins;
  } catch (error) {
    console.error("Error loading poster pins:", error);
    return [];
  }
}

export async function updatePin(request: UpdatePinRequest): Promise<boolean> {
  try {
    console.log("Updating pin:", request);

    await new Promise((resolve) => setTimeout(resolve, 500));

    return true;
  } catch (error) {
    console.error("Error updating pin:", error);
    return false;
  }
}
