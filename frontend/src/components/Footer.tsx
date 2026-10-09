/* eslint-disable @next/next/no-img-element -- static logo */
export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[1110px] px-6 xl:px-0">
      <div className="border-t border-line pt-16 pb-16">
        <img src="/assets/footer-logo.png" alt="Dicoding" width={138} height={34} />
        <address className="mt-8 ml-0.5 max-w-[378px] text-[18px] leading-[26px] text-subtle not-italic">
          Dicoding Space
          <br />
          Jl. Batik Kumeli No.50, Sukaluyu,
          <br />
          Kec. Cibeunying Kaler, Kota Bandung Jawa Barat 40123
        </address>
      </div>
    </footer>
  );
}
