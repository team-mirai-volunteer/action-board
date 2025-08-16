import Image from "next/image";
import Link from "next/link";
import { FOOTER_IMAGE_SIZES } from "./footer";

export function LogoSection() {
  return (
    <div className="bg-white py-8">
      <div className="px-4 md:container md:mx-auto text-center">
        <Link href="/" className="inline-block">
          <Image
            src="/img/footer_logo.webp"
            alt="チームみらい"
            width={FOOTER_IMAGE_SIZES.logo.width}
            height={FOOTER_IMAGE_SIZES.logo.height}
            className="mx-auto"
          />
        </Link>
        <div className="mt-4 flex flex-col justify-center items-center">
          <div
            className="text-black text-center font-bold text-xs leading-5 tracking-[0.24px]"
            style={{ fontFamily: "Noto Sans JP" }}
          >
            アクションボード
          </div>
        </div>
      </div>
    </div>
  );
}
