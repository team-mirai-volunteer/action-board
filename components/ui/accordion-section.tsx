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
  const accordionDefaultValue =
    defaultValue || (type === "multiple" ? [] : undefined);

  const renderAccordionItems = () =>
    items.map((item) => (
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
    ));

  return (
    <div className={containerClassName}>
      {type === "multiple" ? (
        <Accordion
          type="multiple"
          defaultValue={accordionDefaultValue as string[]}
          className={className}
        >
          {renderAccordionItems()}
        </Accordion>
      ) : (
        <Accordion
          type="single"
          defaultValue={accordionDefaultValue as string}
          className={className}
        >
          {renderAccordionItems()}
        </Accordion>
      )}
    </div>
  );
}
