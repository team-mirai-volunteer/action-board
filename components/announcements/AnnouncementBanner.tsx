"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/types/supabase";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import React, { useState } from "react";

type Announcement = Database["public"]["Tables"]["announcements"]["Row"];

interface AnnouncementBannerProps {
  announcements: Announcement[];
}

const typeConfig = {
  info: {
    icon: Info,
    className: "border-blue-500 bg-blue-50 text-blue-900",
  },
  warning: {
    icon: AlertCircle,
    className: "border-yellow-500 bg-yellow-50 text-yellow-900",
  },
  error: {
    icon: XCircle,
    className: "border-red-500 bg-red-50 text-red-900",
  },
  success: {
    icon: CheckCircle,
    className: "border-green-500 bg-green-50 text-green-900",
  },
};

export function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAnnouncements = announcements.filter(
    (announcement) => !dismissedIds.has(announcement.id),
  );

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(Array.from(prev).concat(id)));
  };

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {visibleAnnouncements.map((announcement) => {
        const config = typeConfig[announcement.type as keyof typeof typeConfig];
        const Icon = config.icon;

        return (
          <Alert key={announcement.id} className={config.className}>
            <Icon className="h-4 w-4" />
            <div className="flex-1">
              <AlertTitle>{announcement.title}</AlertTitle>
              <AlertDescription className="mt-1">
                {announcement.content}
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(announcement.id)}
              className="ml-auto h-6 w-6 p-0 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        );
      })}
    </div>
  );
}
