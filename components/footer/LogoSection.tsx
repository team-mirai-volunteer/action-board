import { FOOTER_IMAGE_SIZES } from "@/lib/constants/footer";
import Image from "next/image";

export function LogoSection() {
  return (
    <div className="bg-white py-8">
      <div className="px-4 md:container md:mx-auto text-center">
        <Image
          src="/img/logo.png"
          alt="チームみらい"
          width={FOOTER_IMAGE_SIZES.logo.width}
          height={FOOTER_IMAGE_SIZES.logo.height}
          className="mx-auto"
        />
      </div>
    </div>
  );
}
