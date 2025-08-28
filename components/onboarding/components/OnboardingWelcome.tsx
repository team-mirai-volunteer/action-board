import Image from "next/image";

/**
 * オンボーディングウェルカム画面コンポーネント
 * ロゴとアクションボードテキストを表示
 */
export const OnboardingWelcome: React.FC = () => {
  return (
    <div className="absolute top-20 md:top-16 lg:top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4">
      {/* ロゴ */}
      <div className="relative w-[40vw] h-[20vw] min-[390px]:w-[48vw] min-[390px]:h-[24vw] min-[430px]:w-[56vw] min-[430px]:h-[28vw] sm:w-[36vw] sm:h-[18vw] md:w-[20vw] md:h-[10vw] lg:w-[16vw] lg:h-[8vw] max-w-[12rem] max-h-[6rem]">
        <Image
          src="/img/logo.png"
          alt="チームはやまロゴ"
          fill
          className="object-contain"
        />
      </div>

      {/* アクションボードテキスト */}
      <h5 className="text-black text-base sm:text-lg md:text-base lg:text-lg font-bold tracking-wider w-[40vw] sm:w-24 md:w-40 lg:w-44 text-center">
        アクションボード
      </h5>
    </div>
  );
};
