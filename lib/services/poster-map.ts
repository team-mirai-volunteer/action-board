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
      console.error("Error loading poster pins:", error);
      return [];
    }

    console.log("Raw pins data from Supabase:", pins);

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

    return JSON.parse(JSON.stringify(transformedPins));
  } catch (error) {
    console.error("Error loading poster pins:", error);
    return [];
  }
}

export async function updatePin(request: UpdatePinRequest): Promise<boolean> {
  try {
    const supabase = createClientClient();

    const { error } = await supabase
      .from("pins")
      .update({
        status: request.status,
        note: request.note,
      })
      .eq("id", Number.parseInt(request.id));

    if (error) {
      console.error("Error updating pin:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating pin:", error);
    return false;
  }
}
