export interface PostingEvent {
  slug: string;
  title: string;
  description: string | null;
  is_active: boolean;
}

export interface PostingEventData {
  posting_events: PostingEvent[];
}
