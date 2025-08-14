import {
  CopyrightSection,
  FeedbackSection,
  LogoSection,
  SeasonsList,
} from "@/components/footer";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full mt-16">
      <div className="bg-background">
        <FeedbackSection />
        <LogoSection />
      </div>

      <div className="relative w-full bg-gradient-to-b from-[#A4F1C9] to-[#D1F6DF] overflow-hidden">
        <div className="relative h-[280px]">
          <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center">
            <div className="relative w-[756px] min-w-[756px] h-[392px]">
              <Image
                src="/img/hero-background.svg"
                alt="街並みと雲のイラスト"
                fill
                className="object-contain object-bottom"
              />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center z-10">
            <div className="relative w-[756px] h-[157px]">
              <Image
                src="/img/hero-people.svg"
                alt="チームみらいの仲間たち"
                fill
                className="object-contain object-bottom"
              />
            </div>
          </div>
        </div>

        <div className="relative z-20">
          <SeasonsList />
          <CopyrightSection />
        </div>
      </div>
    </footer>
  );
}
