import { RankingTop } from "@/features/ranking/components/ranking-top";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

export default async function RankingSection() {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl md:text-4xl text-gray-900 mb-8 text-center">
        🏅アクションリーダー
      </h2>
      <Carousel className="max-w-[100vw] px-4">
        <CarouselContent className="mb-4 lg:-ml-6">
          <CarouselItem className="pl-0 lg:basis-1/2 lg:pl-6">
            <RankingTop limit={5} period="daily" title="今日のトップ5" />
          </CarouselItem>
          <CarouselItem className="pl-0 lg:basis-1/2 lg:pl-6">
            <RankingTop limit={5} title="全期間トップ5" />
          </CarouselItem>
        </CarouselContent>
        <div className="flex gap-4 justify-center">
          <CarouselPrevious className="lg:hidden" />
          <CarouselNext className="lg:hidden" />
        </div>
      </Carousel>
      <div className="mt-6 flex justify-center">
        <Link
          href={"/ranking"}
          className="flex items-center text-teal-600 hover:text-teal-700 self-center"
        >
          トップ100を見る
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
