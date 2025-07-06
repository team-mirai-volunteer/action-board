import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type React from "react";

interface BaseRankingProps {
  title: string;
  children: React.ReactNode;
  detailsHref?: string;
  showDetailedInfo?: boolean;
  detailsLinkText?: string;
}

const BaseRanking: React.FC<BaseRankingProps> = ({
  title,
  children,
  detailsHref,
  showDetailedInfo = false,
  detailsLinkText = "トップ100を見る",
}) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-6">
        <Card className="border-2 border-gray-200 rounded-2xl transition-all duration-300 p-8 bg-white">
          <div className="">
            <h2 className="text-xl md:text-2xl text-gray-900 mb-6 text-center">
              {title}
            </h2>
          </div>

          <div className="space-y-1">{children}</div>
        </Card>

        {showDetailedInfo && detailsHref && (
          <Link
            href={detailsHref}
            className="flex items-center text-teal-600 hover:text-teal-700 self-center"
          >
            {detailsLinkText}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default BaseRanking;
