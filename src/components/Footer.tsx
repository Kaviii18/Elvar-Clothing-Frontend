// ═══════════════════════════════════════════════════════════════════════════
//  Footer.tsx · Élvar Clothing · Luxury Minimal Footer
// ═══════════════════════════════════════════════════════════════════════════

import { FC } from "react";

// ── Link data ────────────────────────────────────────────────────────────────

const SHOP_LINKS = [
  "New Arrivals",
  "Batik Collection",
  "Dresses",
  "Sarees",
  "Accessories",
];

const BRAND_LINKS = [
  "Our Story",
  "The Philosophy",
  "Sustainability",
  "Journal",
];

const CARE_LINKS = [
  "Contact Us",
  "Shipping & Delivery",
  "14-Day Returns",
  "Size Guide",
];

const SOCIALS = [
  { label: "Instagram", href: "#" },
  { label: "Facebook",  href: "#" },
  { label: "TikTok", href: "#" },
];

// ── Sub-components ───────────────────────────────────────────────────────────

interface FooterColProps {
  heading: string;
  links: string[];
}

const FooterCol: FC<FooterColProps> = ({ heading, links }) => (
  <div>
    <p
      className="mb-5 text-[#f0ebe1] font-normal"
      style={{
        fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif",
        fontSize: "0.5rem",
        letterSpacing: "0.55em",
        textTransform: "uppercase",
      }}
    >
      {heading}
    </p>
    <ul className="list-none m-0 p-0 flex flex-col gap-3">
      {links.map((link) => (
        <li key={link}>
          <a
            href="#"
            className="text-[rgba(240,235,225,0.28)] hover:text-[#f0ebe1] no-underline
                       transition-colors duration-300"
            style={{
              fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            {link}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

// ── Main Footer ──────────────────────────────────────────────────────────────

const Footer: FC = () => {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      className="w-full"
      style={{ background: "#0a0a08", borderTop: "1px solid rgba(240,235,225,0.06)" }}
    >
      {/* Google fonts — include once per page; harmless if already in head */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Didact+Gothic&display=swap');
      `}</style>

      {/* ── Main grid ─────────────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-16 md:py-20">
        <div
          className="grid gap-12
                     grid-cols-1
                     sm:grid-cols-2
                     lg:grid-cols-[1.8fr_1fr_1fr_1fr]"
        >

          {/* ── Column 1: Brand ─────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Wordmark */}
            <span
              className="text-[#f0ebe1] font-normal tracking-[-0.01em]"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(20px, 2.2vw, 26px)",
              }}
            >
              ÉLVAR CLOTHING
            </span>

            {/* Tagline */}
            <p
              className="text-[rgba(240,235,225,0.28)] leading-[1.82] m-0 max-w-[210px]"
              style={{
                fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.08em",
              }}
            >
              Dressed for those who know the difference.
            </p>

            {/* Thin rule */}
            <div
              className="w-8 h-px opacity-35"
              style={{ background: "#c9a96e" }}
            />

            {/* Social links */}
            <div className="flex flex-col gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="text-[rgba(240,235,225,0.22)] hover:text-[#c9a96e]
                             no-underline transition-colors duration-300
                             inline-flex items-center gap-2 w-fit"
                  style={{
                    fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif",
                    fontSize: "0.5rem",
                    letterSpacing: "0.38em",
                    textTransform: "uppercase",
                  }}
                >
                  {/* Tiny arrow accent */}
                  <span className="opacity-40">↗</span>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Columns 2–4: Nav ────────────────────────────────────── */}
          <FooterCol heading="Shop"          links={SHOP_LINKS}  />
          <FooterCol heading="Our Brand"     links={BRAND_LINKS} />
          <FooterCol heading="Customer Care" links={CARE_LINKS}  />

        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(240,235,225,0.05)" }}>
        <div
          className="max-w-[1280px] mx-auto px-6 md:px-8 py-5
                     flex flex-col sm:flex-row items-start sm:items-center
                     justify-between gap-3"
        >
          {/* Copyright */}
          <p
            className="m-0 text-[rgba(240,235,225,0.14)]"
            style={{
              fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif",
              fontSize: "0.5rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            © {new Date().getFullYear()} Élvar Clothing (Pvt) Ltd. All Rights Reserved.
          </p>

          {/* Right cluster */}
          <div className="flex items-center gap-6">
            {/* Legal micro-links */}
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[rgba(240,235,225,0.14)] hover:text-[rgba(240,235,225,0.42)]
                           no-underline transition-colors duration-300"
                style={{
                  fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif",
                  fontSize: "0.45rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                }}
              >
                {item}
              </a>
            ))}

            {/* Separator */}
            <span
              className="hidden sm:block w-px h-3 opacity-20"
              style={{ background: "#f0ebe1" }}
            />

            {/* Back to top */}
            <button
              onClick={scrollTop}
              className="group flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer
                         text-[rgba(240,235,225,0.22)] hover:text-[#c9a96e] transition-colors duration-300"
              style={{
                fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif",
                fontSize: "0.45rem",
                letterSpacing: "0.34em",
                textTransform: "uppercase",
              }}
            >
              Back to Top
              <span
                className="inline-block transition-transform duration-400
                           group-hover:-translate-y-0.5"
              >
                ↑
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;