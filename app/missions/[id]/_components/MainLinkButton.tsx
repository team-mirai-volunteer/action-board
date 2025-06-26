"use client";

import { Button } from "@/components/ui/button";
import type { Tables } from "@/lib/types/supabase";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MainLinkButtonProps {
  mission: Tables<"missions">;
  mainLink: Tables<"mission_main_links">;
  onLinkClick?: () => Promise<{ success: boolean; error?: string }>;
  isDisabled?: boolean;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function MainLinkButton({
  mission,
  mainLink,
  onLinkClick,
  isDisabled = false,
  variant = "default",
  size = "lg",
  className,
}: MainLinkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    // LINK_ACCESSタイプでonLinkClickが提供されている場合
    if (mission.required_artifact_type === "LINK_ACCESS" && onLinkClick) {
      setIsLoading(true);

      try {
        const result = await onLinkClick();

        if (result.success) {
          // 新しいタブでリンクを開く
          window.open(mainLink.link, "_blank", "noopener,noreferrer");
          toast.success("ミッションを達成しました！");
        } else {
          toast.error(result.error || "エラーが発生しました");
        }
      } catch (error) {
        console.error("Link access error:", error);
        toast.error("予期しないエラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    } else {
      // 通常のリンクとして開く
      window.open(mainLink.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled || isLoading}
      className={className}
      size={size}
      variant={variant}
    >
      <ExternalLink className="mr-2 h-4 w-4" />
      {isLoading ? "処理中..." : mainLink.label}
    </Button>
  );
}
