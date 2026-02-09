"use server";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { PostingShapeStatus } from "../config/status-config";
import {
  authorizeShapeOwnerOrAdmin,
  deleteShape as deleteShapeService,
  saveShape as saveShapeService,
  updateShape as updateShapeService,
  updateShapeStatus as updateShapeStatusService,
} from "../services/posting-shapes";
import type { MapShape } from "../types/posting-types";

async function requireAuth(): Promise<User> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("認証が必要です");
  return user;
}

export async function saveShape(shape: MapShape) {
  await requireAuth();
  return saveShapeService(shape);
}

export async function deleteShape(id: string) {
  const user = await requireAuth();
  await authorizeShapeOwnerOrAdmin(id, user);
  return deleteShapeService(id);
}

export async function updateShape(id: string, data: Partial<MapShape>) {
  const user = await requireAuth();
  await authorizeShapeOwnerOrAdmin(id, user);
  return updateShapeService(id, data);
}

export async function updateShapeStatus(
  id: string,
  status: PostingShapeStatus,
  memo?: string | null,
) {
  const user = await requireAuth();
  await authorizeShapeOwnerOrAdmin(id, user);
  return updateShapeStatusService(id, status, memo);
}
