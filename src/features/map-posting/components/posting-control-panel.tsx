"use client";

interface PostingControlPanelProps {
  eventTitle: string;
  totalPostingCount?: number;
  showOnlyMine: boolean;
  onShowOnlyMineChange: (value: boolean) => void;
}

export function PostingControlPanel({
  eventTitle,
  totalPostingCount,
  showOnlyMine,
  onShowOnlyMineChange,
}: PostingControlPanelProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "10px",
        zIndex: 1000,
        background: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
        {eventTitle}
      </div>
      {totalPostingCount !== undefined && (
        <div
          style={{
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>現在の配布枚数</span>
          <span
            style={{
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {totalPostingCount.toLocaleString()}枚
          </span>
        </div>
      )}
      <label
        style={{
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
          color: showOnlyMine ? "#2563eb" : "#666",
          fontWeight: showOnlyMine ? "bold" : "normal",
        }}
      >
        <input
          type="checkbox"
          checked={showOnlyMine}
          onChange={(e) => onShowOnlyMineChange(e.target.checked)}
          style={{ cursor: "pointer" }}
        />
        自分のエリアのみ表示
      </label>
    </div>
  );
}
