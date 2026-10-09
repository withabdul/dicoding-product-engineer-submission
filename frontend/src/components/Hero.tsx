/* eslint-disable @next/next/no-img-element -- static photo */
import type { ReactNode } from "react";

/** Dark banner with the pill photo that sits at the end of the title. */
export default function Hero({
  eyebrow,
  title,
  subtitle,
  tracking = "-2.2px",
  pillClass = "ml-5 -translate-y-[6px]",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  tracking?: string;
  /** Horizontal gap and vertical nudge of the pill; differs per banner in the design. */
  pillClass?: string;
}) {
  // Negative vertical margins keep the 61px pill from stretching the title line.
  const pill = (
    <span className={`${pillClass} -my-1 inline-block h-[61px] w-[203px] overflow-hidden rounded-[32px] align-middle`}>
      <img
        src="/assets/hero-photo.jpg"
        alt=""
        className="-mt-[15px] h-[136px] w-[203px] max-w-none object-cover"
      />
    </span>
  );

  return (
    <section className="bg-ink text-white">
      <div className="mx-auto h-[262px] max-w-[1110px] px-6 pt-12 xl:px-0">
        {eyebrow && (
          <p className="heading-h5 mb-4 text-accent">{eyebrow}</p>
        )}
        <h1
          className={`text-[40px] font-semibold ${eyebrow ? "leading-[61px]" : "mt-[26px] h-14 leading-[56px]"}`}
          style={{ letterSpacing: tracking }}
        >
          {title}
          {pill}
        </h1>
        {subtitle && <p className="text-body mt-[16px] text-white">{subtitle}</p>}
      </div>
    </section>
  );
}
