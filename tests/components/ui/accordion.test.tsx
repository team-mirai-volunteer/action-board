import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion";

describe("Accordion", () => {
  it("アコーディオンコンポーネント存在確認", () => {
    expect(typeof Accordion).toBe("object");
    expect(typeof AccordionItem).toBe("object");
  });

  it("アコーディオントリガー存在確認", () => {
    expect(typeof AccordionTrigger).toBe("object");
    expect(typeof AccordionContent).toBe("object");
  });
});
