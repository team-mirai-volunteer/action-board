"use server";

import { createClient } from "@/lib/supabase/client";
import type { PostingShapeStatus } from "../config/status-config";
import {
  authorizeShapeOwner,
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
  await authorizeShapeOwner(id, userId);
  return deleteShapeService(id);
}

export async function updateShape(id: string, data: Partial<MapShape>) {
  const userId = await requireAuth();
  await authorizeShapeOwner(id, userId);
  return updateShapeService(id, data);
}

export async function updateShapeStatus(
  id: string,
  status: PostingShapeStatus,
  memo?: string | null,
) {
  const userId = await requireAuth();
  await authorizeShapeOwner(id, userId);
  return updateShapeStatusService(id, status, memo);
}
