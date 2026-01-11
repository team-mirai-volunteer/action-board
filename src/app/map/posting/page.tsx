import { getActiveEvent } from "@/features/map-posting/services/posting-events.server";
import { getUser } from "@/features/user-profile/services/profile";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "チームみらい機関誌配布マップ",
  description: "チームみらい機関誌配布マップ",
};

export default async function PostingPage() {
  const user = await getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get the active event and redirect to its slug
  const activeEvent = await getActiveEvent();

  if (!activeEvent) {
    // No active event found
    return notFound();
  }

  return redirect(`/map/posting/${activeEvent.slug}`);
}
