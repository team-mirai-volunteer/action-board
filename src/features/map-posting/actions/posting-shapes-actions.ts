"use server";

import { createClient } from "@/lib/supabase/client";
import type { PostingShapeStatus } from "../config/status-config";
import {
  deleteShape as deleteShapeService,
  saveShape as saveShapeService,
  updateShape as updateShapeService,
  updateShapeStatus as updateShapeStatusService,
} from "../services/posting-shapes";
import type { MapShape } from "../types/posting-types";

async function requireAuth(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("認証が必要です");
  return user.id;
}

export async function saveShape(shape: MapShape) {
  await requireAuth();
  return saveShapeService(shape);
}

export async function deleteShape(id: string) {
  const userId = await requireAuth();
  return deleteShapeService(id, userId);
}

export async function updateShape(id: string, data: Partial<MapShape>) {
  const userId = await requireAuth();
  return updateShapeService(id, data, userId);
}

export async function updateShapeStatus(
  id: string,
  status: PostingShapeStatus,
  memo?: string | null,
) {
  const userId = await requireAuth();
  return updateShapeStatusService(id, status, memo, userId);
}
