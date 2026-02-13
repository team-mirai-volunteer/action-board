"use server";

import {
  getActiveEvent as getActiveEventService,
  getAllEvents as getAllEventsService,
  getEventBySlug as getEventBySlugService,
} from "../services/posting-events";

export async function getAllEvents() {
  return getAllEventsService();
}

export async function getEventBySlug(slug: string) {
  return getEventBySlugService(slug);
}

export async function getActiveEvent() {
  return getActiveEventService();
}
