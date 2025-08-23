"use client";

import { useState } from "react";

interface CollapsibleInfoProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: "green" | "gray";
}

export function CollapsibleInfo({
  title,
  children,
  defaultOpen = false,
  variant = "green",
}: CollapsibleInfoProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const variantStyles = {
    green: {
      container: "bg-emerald-50 border-emerald-200",
      button: "hover:bg-emerald-100",
      icon: "text-emerald-600",
      title: "text-emerald-800",
      content: "text-emerald-700 border-emerald-200",
    },
    gray: {
      container: "bg-gray-50 border-gray-200",
      button: "hover:bg-gray-100",
      icon: "text-gray-600",
      title: "text-gray-800",
      content: "text-gray-700 border-gray-200",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`border rounded-lg mb-4 ${styles.container}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 text-left transition-colors rounded-lg ${styles.button}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={styles.icon}>
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                role="img"
                aria-label="情報アイコン"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className={`text-sm font-medium ${styles.title}`}>
              {title}
            </span>
          </div>
          <div className={`transition-transform duration-200 ${styles.icon}`}>
            <svg
              className={`w-4 h-4 transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label={isOpen ? "閉じる" : "開く"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-3">
          <div className={`text-sm space-y-2 pt-2 border-t ${styles.content}`}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
