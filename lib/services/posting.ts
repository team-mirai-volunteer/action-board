import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/types/supabase";
import { nanoid } from "nanoid";

export interface MapShape {
  id?: string;
  type: "polygon" | "text";
  coordinates: Json;
  properties?: Json;
  created_at?: string;
  updated_at?: string;
}

const supabase = createClient();

export async function saveShape(shape: MapShape) {
  const nowISO = new Date().toISOString();

  const shapeWithMeta = {
    ...shape,
    id: shape.id ?? `c${nanoid(21)}`, // cuid-like format
    created_at: shape.created_at ?? nowISO,
    updated_at: shape.updated_at ?? nowISO,
  };

  const { data, error } = await supabase
    .from("posting_shapes")
    .insert([shapeWithMeta as never])
    .select()
    .single();

  if (error) {
    console.error("Error saving shape:", error);
    throw error;
  }

  return data;
}

export async function deleteShape(id: string) {
  const { error } = await supabase.from("posting_shapes").delete().eq("id", id);

  if (error) {
    console.error("Error deleting shape:", error);
    throw error;
  }
}

export async function loadShapes() {
  const { data, error } = await supabase
    .from("posting_shapes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading shapes:", error);
    throw error;
  }

  return data || [];
}

export async function updateShape(id: string, data: Partial<MapShape>) {
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: rows, error } = await supabase
    .from("posting_shapes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating shape:", error);
    throw error;
  }

  return rows;
}
