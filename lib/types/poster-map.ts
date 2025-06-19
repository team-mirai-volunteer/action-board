import type { Tables } from "./supabase";
export type City = Pick<Tables<"cities">, "prefecture" | "city">;
export type PinData = Omit<Tables<"pins">, "cities"> & {
  cities: City | null;
};
