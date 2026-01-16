import {
  type PostingShapeStatus,
  postingStatusColors,
} from "../config/status-config";
import type { MarkerWithShape, StatusCounts } from "../types/posting-types";

// Re-export for convenience
export type { MarkerWithShape, StatusCounts };

// マーカー配列からステータス別カウントと合計配布枚数を集計
export function countStatusesFromMarkers(markers: MarkerWithShape[]): {
  statusCounts: StatusCounts;
  totalPostingCount: number;
} {
  const statusCounts: StatusCounts = {
    planned: 0,
    completed: 0,
    unavailable: 0,
    other: 0,
  };
  let totalPostingCount = 0;

  for (const marker of markers) {
    const shape = marker.shapeData;
    if (shape) {
      statusCounts[shape.status]++;
      if (shape.posting_count) {
        totalPostingCount += shape.posting_count;
      }
    }
  }

  return { statusCounts, totalPostingCount };
}

// Create custom marker icon with status color
export function createMarkerIcon(
  L: typeof import("leaflet"),
  status: PostingShapeStatus,
  postingCount?: number | null,
) {
  const color = postingStatusColors[status];
  const showCount = status === "completed" && postingCount;

  // Calculate width based on digit count for proper display
  const getIconWidth = (count: number | null | undefined): number => {
    if (!count) return 16;
    const digits = count.toString().length;
    // Base width + extra per digit + padding for "枚"
    return Math.max(40, 20 + digits * 8);
  };

  const iconWidth = showCount ? getIconWidth(postingCount) : 16;

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: ${showCount ? "auto" : "16px"};
        min-width: 16px;
        height: 16px;
        border-radius: ${showCount ? "8px" : "50%"};
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: ${showCount ? "0 6px" : "0"};
        color: white;
        font-size: 10px;
        font-weight: bold;
        white-space: nowrap;
      ">${showCount ? `${postingCount}枚` : ""}</div>
    `,
    className: "posting-marker",
    iconSize: [iconWidth, 16],
    iconAnchor: [iconWidth / 2, 8],
  });
}

// Calculate display text and appropriate size for cluster icon
function getClusterDisplayInfo(count: number, totalPostingCount: number) {
  const displayText =
    totalPostingCount > 0 ? `${totalPostingCount}枚` : String(count);
  const digits = displayText.length;

  // Base size from marker count
  let baseSize = count < 10 ? 35 : count < 100 ? 45 : 55;

  // Increase size for longer text (4+ digits need more space)
  if (digits >= 5) {
    baseSize = Math.max(baseSize, 60);
  } else if (digits >= 4) {
    baseSize = Math.max(baseSize, 50);
  }

  const fontSize =
    baseSize < 40
      ? "11px"
      : baseSize < 50
        ? "12px"
        : baseSize < 60
          ? "13px"
          : "14px";

  return { displayText, size: baseSize, fontSize };
}

// Create custom cluster icon with pie chart
// biome-ignore lint/suspicious/noExplicitAny: MarkerCluster type not available
export function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  const markers = cluster.getAllChildMarkers() as MarkerWithShape[];

  const { statusCounts, totalPostingCount } = countStatusesFromMarkers(markers);

  const { displayText, size, fontSize } = getClusterDisplayInfo(
    count,
    totalPostingCount,
  );

  // Count non-zero statuses
  const nonZeroStatuses = Object.entries(statusCounts).filter(([, c]) => c > 0);

  let backgroundContent: string;
  if (nonZeroStatuses.length > 1) {
    // Create pie chart segments
    const segments: string[] = [];
    const radius = (size - 6) / 2;
    const center = size / 2;
    let cumulativePercentage = 0;

    const statusOrder: PostingShapeStatus[] = [
      "completed",
      "planned",
      "unavailable",
      "other",
    ];

    for (const status of statusOrder) {
      const statusCount = statusCounts[status];
      if (statusCount === 0) continue;

      const percentage = statusCount / count;

      if (percentage >= 1) {
        segments.push(
          `<circle cx="${center}" cy="${center}" r="${radius}" fill="${postingStatusColors[status]}" />`,
        );
        break;
      }

      const circumference = 2 * Math.PI * radius;
      const strokeLength = circumference * percentage;
      const gapLength = circumference - strokeLength;
      const rotation = cumulativePercentage * 360 - 90;

      segments.push(`
        <circle
          cx="${center}"
          cy="${center}"
          r="${radius}"
          fill="none"
          stroke="${postingStatusColors[status]}"
          stroke-width="${radius * 2}"
          stroke-dasharray="${strokeLength} ${gapLength}"
          stroke-dashoffset="0"
          transform="rotate(${rotation} ${center} ${center})"
        />
      `);

      cumulativePercentage += percentage;
    }

    backgroundContent = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="position: absolute; top: -3px; left: -3px;">
        ${segments.join("")}
        <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central" fill="white" font-size="${fontSize}" font-weight="bold" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
          ${displayText}
        </text>
      </svg>
    `;
  } else {
    // Single status - use solid color
    const dominantStatus =
      (nonZeroStatuses[0]?.[0] as PostingShapeStatus) || "planned";
    const color = postingStatusColors[dominantStatus];
    backgroundContent = `
      <div style="
        background-color: ${color};
        width: calc(100% + 6px);
        height: calc(100% + 6px);
        border-radius: 50%;
        position: absolute;
        top: -3px;
        left: -3px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${fontSize};
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
      ">${displayText}</div>
    `;
  }

  // biome-ignore lint/suspicious/noExplicitAny: Leaflet global
  return (window as any).L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
        overflow: hidden;
      ">
        ${backgroundContent}
      </div>
    `,
    className: "posting-cluster",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
