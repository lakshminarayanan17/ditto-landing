import Image from "next/image";

export function HeroSection() {
  return (
    <div className="flex flex-col items-center gap-6 lg:items-start lg:gap-8">
      {/* Social Proof Badges */}
      <div className="flex items-center justify-center gap-4 lg:justify-start lg:gap-6">
        <BadgeWithWreath>
          <div className="flex items-center gap-1.5">
            <Image src="/icons/rating-4-9.svg" alt="4.9" width={36} height={20} />
            <Image src="/icons/star.svg" alt="" width={18} height={17} />
          </div>
          <p className="w-[84px] text-center text-[10px] leading-tight text-ditto-grey-400">
            10000+ ratings on Google
          </p>
        </BadgeWithWreath>

        <BadgeWithWreath>
          <Image
            src="/icons/zerodha-logo.svg"
            alt="Zerodha"
            width={25}
            height={24}
          />
          <p className="text-center text-[10px] leading-tight text-ditto-grey-400">
            Backed by
            <br />
            Zerodha
          </p>
        </BadgeWithWreath>
      </div>

      {/* Headline */}
      <h1 className="max-w-[308px] text-center font-heading text-[31px] font-bold leading-[1.09] tracking-tight text-ditto-black lg:max-w-[576px] lg:text-left lg:text-[51px] lg:leading-[1.06]">
        The Ultimate Insurance Buying Experience
      </h1>

      {/* Hero Image — hidden on mobile, shown after the card via page layout */}
      <div className="relative mt-2 hidden w-full max-w-[636px] overflow-hidden rounded-2xl lg:block">
        <Image
          src="/images/professional-advice.png"
          alt="Professional Advice — Which life insurance is best for me?"
          width={636}
          height={336}
          sizes="(max-width: 1024px) 343px, 636px"
          className="h-auto w-full"
          priority
        />
      </div>
    </div>
  );
}

function BadgeWithWreath({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0">
      {/* Left wreath */}
      <Image
        src="/icons/wreath-left.svg"
        alt=""
        width={30}
        height={67}
        className="h-[52px] w-auto"
      />

      {/* Center content */}
      <div className="flex flex-col items-center gap-1.5 px-1">
        {children}
      </div>

      {/* Right wreath (mirrored) */}
      <Image
        src="/icons/wreath-left.svg"
        alt=""
        width={30}
        height={67}
        className="h-[52px] w-auto -scale-x-100"
      />
    </div>
  );
}
