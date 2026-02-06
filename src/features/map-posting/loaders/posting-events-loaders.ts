"use server";

import { getAllEvents as getAllEventsService } from "../services/posting-events";

export async function getAllEvents() {
  return getAllEventsService();
}
