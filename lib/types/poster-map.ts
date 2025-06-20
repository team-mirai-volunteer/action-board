import type { Tables } from "./supabase";

export type City = Tables<"cities">;

export type PinData = Tables<"pins"> & {
  cities: City | null;
};
