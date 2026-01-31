"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RankingTabsProps {
  children: React.ReactNode;
  seasonSlug?: string; // シーズン固有のコンテキスト用
}

export function RankingTabs({ children, seasonSlug }: RankingTabsProps) {
  const pathname = usePathname();
  const isMissionPage = pathname.includes("ranking-mission");
  const isPrefecturePage = pathname.includes("ranking-prefecture");

  // パスに基づいてタブの値を決定
  const getTabValue = () => {
    if (isMissionPage || pathname.includes("/ranking/mission"))
      return "mission";
    if (isPrefecturePage || pathname.includes("/ranking/prefecture"))
      return "prefecture";
    return "overall";
  };

  // シーズン固有のURL生成
  const getTabHref = (tab: string) => {
    if (seasonSlug) {
      // シーズン固有のページの場合
      switch (tab) {
        case "overall":
          return `/seasons/${seasonSlug}/ranking`;
        case "prefecture":
          return `/seasons/${seasonSlug}/ranking/prefecture`;
        case "mission":
          return `/seasons/${seasonSlug}/ranking/mission`;
        default:
          return `/seasons/${seasonSlug}/ranking`;
      }
    }
    // 通常のランキングページの場合
    switch (tab) {
      case "overall":
        return "/ranking";
      case "prefecture":
        return "/ranking/ranking-prefecture";
      case "mission":
        return "/ranking/ranking-mission";
      default:
        return "/ranking";
    }
  };

  return (
    <Tabs value={getTabValue()} className="w-full max-w-6xl mx-auto px-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overall" asChild>
          <Link href={getTabHref("overall")}>全体</Link>
        </TabsTrigger>
        <TabsTrigger value="prefecture" asChild>
          <Link href={getTabHref("prefecture")}>都道府県別</Link>
        </TabsTrigger>
        <TabsTrigger value="mission" asChild>
          <Link href={getTabHref("mission")}>ミッション別</Link>
        </TabsTrigger>
      </TabsList>
      <TabsContent value={getTabValue()}>{children}</TabsContent>
    </Tabs>
  );
}
