import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getActiveEvent,
  getAllEvents,
} from "@/features/map-posting/services/posting-events.server";
import { getUser } from "@/features/user-profile/services/profile";

export const metadata: Metadata = {
  title: "チームみらいポスティングマップ",
  description: "チームみらいポスティングマップ",
};

export default async function PostingPage() {
  const user = await getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get the active event and redirect to its slug
  const activeEvent = await getActiveEvent();

  if (activeEvent) {
    return redirect(`/map/posting/${activeEvent.slug}`);
  }

  // No active event found - redirect to the latest event
  const allEvents = await getAllEvents();

  if (allEvents.length === 0) {
    // No events at all
    return notFound();
  }

  // allEvents is sorted by created_at descending, so the first one is the latest
  return redirect(`/map/posting/${allEvents[0].slug}`);
}
