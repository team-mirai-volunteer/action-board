import {
  CopyrightSection,
  FeedbackSection,
  LogoSection,
} from "@/components/footer";

export default function Footer() {
  return (
    <footer className="w-full mt-16 bg-background">
      <FeedbackSection />

      <LogoSection />

      <CopyrightSection />
    </footer>
  );
}
