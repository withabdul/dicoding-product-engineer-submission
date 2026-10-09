/* eslint-disable @next/next/no-img-element -- small static SVGs, next/image adds nothing */
export default function Icon({ name, size = 16 }: { name: string; size?: number }) {
  return (
    <img
      src={`/assets/icon-${name}.svg`}
      alt=""
      width={size}
      height={size}
      className="shrink-0"
    />
  );
}
