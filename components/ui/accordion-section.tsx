"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ReactNode } from "react";

export interface AccordionSectionItem {
  value: string;
  title: string;
  content: ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
}

export interface AccordionSectionProps {
  items: AccordionSectionItem[];
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  className?: string;
  containerClassName?: string;
}

export function AccordionSection({
  items,
  type = "multiple",
  defaultValue,
  className = "w-full",
  containerClassName = "px-4 md:container md:mx-auto",
}: AccordionSectionProps) {
  return (
    <div className={containerClassName}>
      <Accordion
        {...(type === "multiple"
          ? {
              type: "multiple" as const,
              defaultValue: (defaultValue as string[]) || [],
            }
          : {
              type: "single" as const,
              defaultValue: (defaultValue as string) || undefined,
            })}
        className={className}
      >
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger
              className={
                item.triggerClassName ||
                "text-base font-bold no-underline hover:no-underline"
              }
            >
              {item.title}
            </AccordionTrigger>
            <AccordionContent className={item.contentClassName}>
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
