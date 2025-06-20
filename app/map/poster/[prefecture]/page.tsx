import { PosterMap } from "@/components/PosterMap";

export default function PrefectureMapPage({
  params,
}: { params: { prefecture: string } }) {
  const prefecture = decodeURIComponent(params.prefecture);
  return <PosterMap prefecture={prefecture} />;
}
