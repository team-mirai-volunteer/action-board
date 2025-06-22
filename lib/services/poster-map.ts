import { createClient as createClientClient } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import type { PinData, UpdatePinRequest } from "@/lib/types/poster-map";

export async function getBoardPins(prefecture: string): Promise<PinData[]> {
  try {
    const supabase = await createClient();

    const { data: pins, error } = await supabase
      .from("pins")
      .select(`
        id,
        number,
        address,
        place_name,
        lat,
        long,
        status,
        note,
        created_at,
        updated_by,
        cities!inner(
          prefecture
        )
      `)
      .eq("cities.prefecture", prefecture);

    if (error) {
      throw new Error(error.message || "Database error occurred");
    }

    const transformedPins: PinData[] = pins.map((pin) => ({
      id: pin.id.toString(),
      number: pin.number || "",
      address: pin.address || "",
      place_name: pin.place_name || "",
      lat: pin.lat || 0,
      long: pin.long || 0,
      status: pin.status,
      note: pin.note || "",
      created_at:
        typeof pin.created_at === "string"
          ? pin.created_at
          : new Date(pin.created_at).toISOString(),
      updated_at: undefined,
    }));

    return transformedPins;
  } catch (error) {
    console.error("Error loading poster pins:", error);
    throw error;
  }
}

export async function updatePin(request: UpdatePinRequest): Promise<PinData> {
  try {
    const supabase = createClientClient();

    const { data, error } = await supabase
      .from("pins")
      .update({
        status: request.status,
        note: request.note,
        updated_at: new Date().toISOString(),
      })
      .eq("id", Number.parseInt(request.id))
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Update error occurred");
    }

    return {
      id: data.id.toString(),
      number: data.number || "",
      address: data.address || "",
      place_name: data.place_name || "",
      lat: data.lat || 0,
      long: data.long || 0,
      status: data.status,
      note: data.note || "",
      created_at: data.created_at,
      updated_at: data.updated_at || undefined,
    };
  } catch (error) {
    console.error("Error updating pin:", error);
    throw error;
  }
}
