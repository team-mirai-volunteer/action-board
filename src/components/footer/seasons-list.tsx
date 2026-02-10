import Link from "next/link";
import { getInactiveSeasons } from "@/lib/loaders/seasons-loaders";

export async function SeasonsList() {
  const seasons = await getInactiveSeasons();

  if (seasons.length === 0) {
    return null;
  }

  return (
    <div className="px-6 py-4 bg-emerald-50/80 backdrop-blur-xs border-t border-emerald-100">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-sm font-medium text-gray-700 mb-3">過去シーズン</h3>
        <div className="flex flex-wrap gap-2">
          {seasons.map((season) => (
            <Link
              key={season.id}
              href={
                season.is_active
                  ? "/ranking"
                  : `/seasons/${season.slug}/ranking`
              }
              className="px-3 py-1 rounded-full text-sm transition-colors bg-white text-gray-700 hover:bg-gray-50 border border-emerald-200"
            >
              {season.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
