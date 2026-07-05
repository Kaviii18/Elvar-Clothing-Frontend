// ═══════════════════════════════════════════════════════════════════════════
//  PhilosophySection.tsx · Élvar Clothing
// ═══════════════════════════════════════════════════════════════════════════

import { FC } from "react";
import { useNavigate } from "react-router-dom";

// ── Images imported directly from src/images ──────────────────────────────
const mainPortraitImg = new URL("../images/philo2.png", import.meta.url).href;
const detailShotImg   = new URL("../images/philo1.png", import.meta.url).href;

const PhilosophySection: FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#0a0a08] py-16 sm:py-24 px-4 sm:px-6 md:px-8 overflow-hidden">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

        {/* ── LEFT: Editorial Typography ── */}
        <div className="order-2 lg:order-1 text-center lg:text-left">
          <p
            className="font-sans text-[0.55rem] tracking-[0.62em] uppercase text-[#c9a96e] mb-4"
            style={{ fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif" }}
          >
            The Philosophy
          </p>

          <h2
            className="font-serif font-normal leading-[1.15] lg:leading-[1.06] tracking-[-0.02em] text-[#f0ebe1] mb-6"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 52px)",
            }}
          >
            Dressed for those<br />
            <span className="italic text-[#c9a96e] font-normal">who know</span> the&nbsp;difference.
          </h2>

          {/* Divider */}
          <div className="w-9 h-px bg-[#c9a96e] opacity-55 mb-6 mx-auto lg:mx-0" />

          <p
            className="text-[#f0ebe1]/60 leading-[1.8] mb-4 max-w-xl mx-auto lg:mx-0 text-justify sm:text-center lg:text-left"
            style={{ fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif", fontSize: 13 }}
          >
            At Élvar Clothing, we craft garments for the discerning individual — pieces that exist beyond seasons and trends. Every silhouette is born from meticulous attention to detail, sustainable fabrics, and an unwavering commitment to modern sophistication.
          </p>
          <p
            className="text-[#f0ebe1]/60 leading-[1.8] mb-8 max-w-xl mx-auto lg:mx-0 text-justify sm:text-center lg:text-left"
            style={{ fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif", fontSize: 13 }}
          >
            Rooted in island heritage and inspired by global elegance, we honor both tradition and innovation. Luxury redefined — not through excess, but through restraint and&nbsp;precision.
          </p>

          <button
            onClick={() => navigate("/about")}
            className="group inline-flex items-center gap-2.5 bg-none border-none p-0 cursor-pointer text-[#f0ebe1]/40 hover:text-[#c9a96e] transition-colors duration-300"
            style={{ fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif", fontSize: "0.55rem", letterSpacing: "0.46em", textTransform: "uppercase" }}
          >
            Our Full Story
            <svg
              width="14" height="8" viewBox="0 0 14 8" fill="none"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M1 4h12M8 1l5 3-5 3" />
            </svg>
          </button>
        </div>

        {/* ── RIGHT: Asymmetric Editorial Image Block ── */}
        <div className="order-1 lg:order-2 relative w-full" style={{ paddingBottom: "clamp(0px, 4vw, 32px)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr] gap-6 sm:gap-4 items-start">

            {/* Image 1: Main portrait */}
            <div className="relative overflow-hidden rounded-2xl bg-[#111110] border border-[rgba(240,235,225,0.06)] aspect-[3/4] w-full max-w-md mx-auto sm:max-w-none">
              <img
                src={mainPortraitImg}
                alt="Élvar clothing — brand main portrait"
                className="w-full h-full object-cover object-center block transition-transform duration-[1100ms] ease-out hover:scale-105"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(10,10,8,0.62) 0%, transparent 100%)" }}
              />
            </div>

            {/* Right sub-column */}
            <div className="flex flex-col gap-4 w-full max-w-md mx-auto sm:max-w-none sm:mt-10">

              {/* Image 2: Detail shot */}
              <div className="relative overflow-hidden rounded-[14px] bg-[#111110] border border-[rgba(240,235,225,0.06)] aspect-[3/4] sm:aspect-auto">
                <img
                  src={detailShotImg}
                  alt="Élvar clothing — model campaign detail"
                  className="w-full h-full sm:h-auto sm:max-h-[240px] object-cover object-center block transition-transform duration-[1100ms] ease-out hover:scale-105"
                />
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                    backgroundSize: "160px 160px",
                  }}
                />
              </div>

              {/* Quote card */}
              <div
                className="rounded-[14px] p-5 flex flex-col gap-3"
                style={{
                  background: "rgba(201,169,110,0.055)",
                  border: "1px solid rgba(201,169,110,0.15)",
                }}
              >
                <div className="w-5 h-px bg-[#c9a96e] opacity-60" />
                <p
                  className="text-[#f0ebe1]/50 italic leading-[1.65] m-0"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 13 }}
                >
                  "Crafted for those who wear intention, not just clothing."
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-[#c9a96e] font-normal leading-none"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24 }}
                  >
                    100
                  </span>
                  <span
                    className="text-[#f0ebe1]/30 uppercase"
                    style={{ fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif", fontSize: "0.48rem", letterSpacing: "0.4em" }}
                  >
                    % Island-made
                  </span>
                </div>
              </div>

              {/* Founder callout */}
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl w-full"
                style={{ border: "1px solid rgba(240,235,225,0.05)" }}
              >
                <div className="w-px h-6 bg-[#c9a96e] opacity-40 flex-shrink-0" />
                <p
                  className="text-[#f0ebe1]/30 m-0 leading-tight"
                  style={{ fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif", fontSize: "0.55rem", letterSpacing: "0.36em", textTransform: "uppercase" }}
                >
                  Est. Colombo, Sri Lanka
                </p>
              </div>
            </div>

          </div>

          {/* Floating accent dot */}
          <div className="absolute -bottom-3 left-[42%] w-1.5 h-1.5 rounded-full bg-[#c9a96e] opacity-40 hidden lg:block pointer-events-none" />
        </div>

      </div>
    </section>
  );
};

export default PhilosophySection;