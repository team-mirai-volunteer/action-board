import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { RankingTop } from "@/features/ranking/components/ranking-top";

export default async function RankingSection() {
  return (
    // 横幅・左右位置・カード間隔は上部のサポーター向けリンクカード（SupporterQuickLinks）と揃える（max-w-4xl）
    <div className="w-full max-w-4xl mx-auto px-4">
      <h2 className="text-2xl md:text-3xl text-gray-900 mb-4 text-center">
        🏅アクションリーダー
      </h2>
      <Carousel className="max-w-[100vw]">
        <CarouselContent className="mb-3 lg:mb-0 lg:-ml-4">
          <CarouselItem className="pl-0 lg:basis-1/2 lg:pl-4">
            <RankingTop
              limit={3}
              period="daily"
              title="今日のトップ3"
              compact
            />
          </CarouselItem>
          <CarouselItem className="pl-0 lg:basis-1/2 lg:pl-4">
            <RankingTop limit={3} title="全期間トップ3" compact />
          </CarouselItem>
        </CarouselContent>
        <div className="flex gap-4 justify-center lg:hidden">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
      <div className="mt-4 flex justify-center">
        <Link
          href={"/ranking"}
          className="flex items-center hover:text-teal-700 self-center"
        >
          トップ100を見る
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
