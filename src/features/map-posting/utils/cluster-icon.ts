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
        padding: ${showCount ? "0 4px" : "0"};
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">${showCount ? `${postingCount}枚` : ""}</div>
    `,
    className: "posting-marker",
    iconSize: [showCount ? 40 : 16, 16],
    iconAnchor: [showCount ? 20 : 8, 8],
  });
}

// Create custom cluster icon with pie chart
// biome-ignore lint/suspicious/noExplicitAny: MarkerCluster type not available
export function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  const markers = cluster.getAllChildMarkers() as MarkerWithShape[];

  const { statusCounts, totalPostingCount } = countStatusesFromMarkers(markers);

  const size = count < 10 ? 35 : count < 100 ? 45 : 55;
  const fontSize = size < 40 ? "11px" : size < 50 ? "13px" : "15px";

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
          ${totalPostingCount > 0 ? `${totalPostingCount}枚` : count}
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
      ">${totalPostingCount > 0 ? `${totalPostingCount}枚` : count}</div>
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
