import Image from "next/image";
import { FOOTER_IMAGE_SIZES } from "./footer";

export function LogoSection() {
  return (
    <div className="bg-white py-8">
      <div className="px-4 md:container md:mx-auto text-center">
        <Image
          src="/img/logo_shiro.png"
          alt="チームみらい"
          width={FOOTER_IMAGE_SIZES.logo.width}
          height={FOOTER_IMAGE_SIZES.logo.height}
          className="mx-auto"
        />
      </div>
    </div>
  );
}
