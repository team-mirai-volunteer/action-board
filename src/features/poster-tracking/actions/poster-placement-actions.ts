"use server";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  authorizePlacementOwner,
  createPlacement as createPlacementService,
  deletePlacement as deletePlacementService,
  updatePlacement as updatePlacementService,
} from "../services/poster-placements";
import type {
  CreatePlacementInput,
  UpdatePlacementInput,
} from "../types/poster-tracking-types";

async function requireAuth(): Promise<User> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("認証が必要です");
  return user;
}

export async function createPlacementAction(input: CreatePlacementInput) {
  const user = await requireAuth();
  return createPlacementService(user.id, input);
}

export async function updatePlacementAction(
  id: string,
  input: UpdatePlacementInput,
) {
  const user = await requireAuth();
  await authorizePlacementOwner(id, user.id);
  return updatePlacementService(id, input);
}

export async function deletePlacementAction(id: string) {
  const user = await requireAuth();
  await authorizePlacementOwner(id, user.id);
  return deletePlacementService(id);
}
