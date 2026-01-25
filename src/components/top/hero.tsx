import { Button } from "@/components/ui/button";
import { OnboardingButton } from "@/features/onboarding/components/onboarding-button";
import Levels from "@/features/user-level/components/levels";
import { getUser } from "@/features/user-profile/services/profile";
import Image from "next/image";
import Link from "next/link";

export default async function Hero() {
  const user = await getUser();

  if (user) {
    try {
      return <Levels userId={user.id} clickable={true} showBadge={true} />;
    } catch (error) {
      console.error("Error fetching user levels:", error);
    }
  }

  return (
    <section className="relative w-full h-[640px] bg-linear-to-b from-[#A4F1C9] to-[#D1F6DF] overflow-hidden">
      <div className="absolute inset-0 w-full h-full flex justify-center items-end">
        <div className="relative w-[1080px] min-w-[1080px] h-[560px]">
          <Image
            src="/img/hero-background.svg"
            alt="街並みと雲のイラスト"
            fill
            className="object-contain object-bottom"
            priority
          />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 px-4 pt-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* ロゴ画像 */}
          <div className="flex justify-center mb-8">
            <Image
              src="/img/logo.png"
              alt="チームみらい"
              width={143}
              height={120}
              sizes="100vw"
              className="h-[120px] w-auto"
            />
          </div>

          <h1 className="text-4xl md:text-4xl font-bold text-gray-800 mb-4">
            アクションボード
          </h1>
          <p className="text-xs text-[#0f8472] font-bold mb-8 px-3">
            テクノロジーで政治をかえる。あなたと一緒に未来をつくる。
          </p>

          {!user && (
            <div className="flex flex-col items-center gap-4">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-[#FA5A77] hover:bg-[#E0425E] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-base whitespace-nowrap min-w-fit"
                >
                  アクションボードに登録する
                </Button>
              </Link>

              <OnboardingButton
                variant="link"
                className="text-sm text-[#0f8472] hover:text-[#0d6b5e] underline font-medium transition-colors duration-200"
              >
                アクションボードとは？
              </OnboardingButton>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center z-10">
        <div className="relative w-full max-w-[1080px] h-[224px]">
          <Image
            src="/img/hero-people.svg"
            alt="チームみらいの仲間たち"
            fill
            className="object-contain object-bottom"
            priority
          />
        </div>
      </div>
    </section>
  );
}
