import { createClient } from "@/lib/supabase/client";

export interface BoardPin {
  id?: string;
  name: string;
  lat: number;
  long: number;
  status: number;
  area_id: number;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VoteVenue {
  id?: string;
  name: string;
  lat: number;
  long: number;
  address: string;
  period: string;
  created_at?: string;
  updated_at?: string;
}

export interface AreaData {
  id: number;
  area_name: string;
}

export interface ProgressData {
  total: number;
}

const supabase = createClient();

export async function getBoardPins(
  block?: string | null,
  smallBlock?: string | null,
): Promise<BoardPin[]> {
  try {
    const mockPins: BoardPin[] = [
      {
        id: "1",
        name: "サンプル掲示板1",
        lat: 35.6762,
        long: 139.6503,
        status: 0,
        area_id: 1,
        note: "テスト用のピンです",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        name: "サンプル掲示板2",
        lat: 35.6895,
        long: 139.6917,
        status: 1,
        area_id: 1,
        note: "完了済みのピンです",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return mockPins;
  } catch (error) {
    console.error("Error loading board pins:", error);
    return [];
  }
}

export async function getVoteVenues(): Promise<VoteVenue[]> {
  try {
    const mockVenues: VoteVenue[] = [
      {
        id: "1",
        name: "渋谷区役所",
        lat: 35.6627,
        long: 139.6983,
        address: "東京都渋谷区宇田川町1-1",
        period: "2024年6月1日〜6月30日",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return mockVenues;
  } catch (error) {
    console.error("Error loading vote venues:", error);
    return [];
  }
}

export async function getAreaList(): Promise<Record<number, AreaData>> {
  try {
    const mockAreas: AreaData[] = [
      { id: 1, area_name: "渋谷区" },
      { id: 2, area_name: "新宿区" },
      { id: 3, area_name: "港区" },
    ];

    const areaMap: Record<number, AreaData> = {};
    for (const area of mockAreas) {
      areaMap[area.id] = area;
    }

    return areaMap;
  } catch (error) {
    console.error("Error loading areas:", error);
    return {};
  }
}

export async function getProgress(): Promise<ProgressData> {
  try {
    return { total: 0.75 }; // 75% progress
  } catch (error) {
    console.error("Error loading progress:", error);
    return { total: 0 };
  }
}

export async function getProgressCountdown(): Promise<ProgressData> {
  try {
    return { total: 150 }; // Total count of pins
  } catch (error) {
    console.error("Error loading progress countdown:", error);
    return { total: 0 };
  }
}
