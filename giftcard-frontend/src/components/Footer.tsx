"use client";

import Link from "next/link";

export default function NepalFooter() {
  return (
    <footer className="bg-[#111111] text-white">
      {/* Main Footer Content */}
      <div className="px-4 md:px-8 lg:px-12 xl:px-16 pt-8 pb-8">
        <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-8">
          {/* Column 1: Brand */}
          <div className="max-w-[360px]">
            <Link href="/" className="">
            <span className="text-[22px] font-extrabold tracking-tight text-white uppercase block mb-4">
              GIFTNOW.
            </span>
            </Link>
            <p className="text-[13px] text-[#999] leading-relaxed mb-6">
              Nepal&apos;s simplest gift card platform. Send instantly, redeem
              anytime, keep forever. Trusted by thousands.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-[#999] hover:text-white hover:border-[#555] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
                </svg>
              </a>
              {/* X (Twitter) */}
              <a
                href="#"
                aria-label="X (Twitter)"
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-[#999] hover:text-white hover:border-[#555] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-[#999] hover:text-white hover:border-[#555] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Section Container */}
          <div className="flex flex-row gap-16 sm:gap-10 md:gap-32">
            {/* Column 2: Products */}
            <div className="min-w-[50px]">
              <h4 className="text-[14px] font-bold mb-5 tracking-wide">
                Products
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/giftnow/buy"
                    className="text-[13px] text-[#999] hover:text-white transition-colors"
                  >
                    Gift Cards
                  </Link>
                </li>
                <li>
                  <Link
                    href="/customer/wallet"
                    className="text-[13px] text-[#999] hover:text-white transition-colors"
                  >
                    Redeem
                  </Link>
                </li>
                <li>
                  <Link
                    href="/business"
                    className="text-[13px] text-[#999] hover:text-white transition-colors"
                  >
                    Business
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div className="min-w-[10px]">
              <h4 className="text-[14px] font-bold mb-5 tracking-wide">
                Support
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-[13px] text-[#999] hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-[13px] text-[#999] hover:text-white transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-[13px] text-[#999] hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#222]">
        <div className="px-4 md:px-8 lg:px-12 xl:px-16 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[12px] text-[#666]">
          <p>© 2026 Su Indra Groups Pvt. Ltd. · Janakpurdham, Nepal</p>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}