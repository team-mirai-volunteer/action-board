import { Card } from "@/components/ui/card";
import { getEvents } from "@/lib/services/events";
import { dateTimeFormatter } from "@/lib/utils/date-formatters";

export default async function Events() {
  const events = await getEvents();

  return (
    <div className="flex flex-col px-5 py-6 gap-2">
      <h2 className="text-lg font-bold">今後のイベント</h2>

      {events.map((event) => (
        <Card key={event.id} className="flex flex-col p-4">
          <div className="flex flex-col gap-1">
            <p>{dateTimeFormatter(new Date(event.starts_at))}</p>
            <p>{event.title}</p>
            <a href={event.url}>リンク</a>
          </div>
        </Card>
      ))}
    </div>
  );
}
