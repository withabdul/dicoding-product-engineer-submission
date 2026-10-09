/* eslint-disable @next/next/no-img-element -- static logo art */
/** Company logo tile. The art is a placeholder: companies have no logo upload yet. */
export default function CompanyLogo({ size = 96 }: { size?: number }) {
  return (
    <div
      className="shrink-0 overflow-hidden rounded bg-brand ring-1 ring-line ring-inset"
      style={{ width: size, height: size }}
    >
      <img src="/assets/logo-card.png" alt="" className="h-full w-full object-cover" />
    </div>
  );
}
