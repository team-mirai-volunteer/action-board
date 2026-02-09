"use server";

import { createClient } from "@/lib/supabase/client";
import { isAdmin, isPostingAdmin } from "@/lib/utils/admin";
import type { PostingShapeStatus } from "../config/status-config";
import {
  authorizeShapeOwnerOrAdmin,
  deleteShape as deleteShapeService,
  saveShape as saveShapeService,
  updateShape as updateShapeService,
  updateShapeStatus as updateShapeStatusService,
} from "../services/posting-shapes";
import type { MapShape } from "../types/posting-types";

async function requireAuth(): Promise<{ userId: string; admin: boolean }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("認証が必要です");
  return { userId: user.id, admin: isAdmin(user) || isPostingAdmin(user) };
}

export async function saveShape(shape: MapShape) {
  await requireAuth();
  return saveShapeService(shape);
}

export async function deleteShape(id: string) {
  const { userId, admin } = await requireAuth();
  await authorizeShapeOwnerOrAdmin(id, userId, admin);
  return deleteShapeService(id);
}

export async function updateShape(id: string, data: Partial<MapShape>) {
  const { userId, admin } = await requireAuth();
  await authorizeShapeOwnerOrAdmin(id, userId, admin);
  return updateShapeService(id, data);
}

export async function updateShapeStatus(
  id: string,
  status: PostingShapeStatus,
  memo?: string | null,
) {
  const { userId, admin } = await requireAuth();
  await authorizeShapeOwnerOrAdmin(id, userId, admin);
  return updateShapeStatusService(id, status, memo);
}
