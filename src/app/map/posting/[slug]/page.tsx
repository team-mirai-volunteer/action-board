import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PostingPageClient from "@/features/map-posting/components/posting-page";
import { getEventBySlug } from "@/features/map-posting/services/posting-events.server";
import { getUser } from "@/features/user-profile/services/profile";
import { isAdmin, isPostingAdmin } from "@/lib/utils/admin";

interface PostingEventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PostingEventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "イベントが見つかりません",
    };
  }

  return {
    title: `${event.title} - チームみらいポスティングマップ`,
    description: event.description || `${event.title}のポスティングマップ`,
  };
}

export default async function PostingEventPage({
  params,
}: PostingEventPageProps) {
  const { slug } = await params;
  const user = await getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const event = await getEventBySlug(slug);

  if (!event) {
    return notFound();
  }

  return (
    <PostingPageClient
      userId={user.id}
      eventId={event.id}
      eventTitle={event.title}
      isAdmin={isAdmin(user) || isPostingAdmin(user)}
      isEventActive={event.is_active}
    />
  );
}
