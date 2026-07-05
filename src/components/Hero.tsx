// ═══════════════════════════════════════════════════════════════════════════
//  Hero.tsx · Élvar Clothing
//  Standalone auto-play hero slider.
//  Props: onShop() — scroll callback from parent
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback, FC } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES & DATA
// ─────────────────────────────────────────────────────────────────────────────

interface Slide {
  id:    number;
  image: string;
  label: string;
  title: string;       // newline-separated for line breaks
  sub:   string;
  cta:   string;
  align: "left" | "right";
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1800&q=85&auto=format&fit=crop",
    label: "SS 2025",
    title: "THE ÉLVAR\nCOLLECTION",
    sub:   "Refined silhouettes for the discerning few",
    cta:   "Discover Now",
    align: "left",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1800&q=85&auto=format&fit=crop",
    label: "Exclusive",
    title: "ISLAND\nCOUTURE",
    sub:   "Handcrafted in the tropics — worn worldwide",
    cta:   "Shop the Edit",
    align: "right",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=85&auto=format&fit=crop",
    label: "New Arrivals",
    title: "MAISON\nNOIR",
    sub:   "The season's darkest, most beautiful pieces",
    cta:   "Explore",
    align: "left",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&q=85&auto=format&fit=crop",
    label: "Resort '25",
    title: "GOLDEN\nHOUR",
    sub:   "Sun-drenched luxury — from coast to city",
    cta:   "View Collection",
    align: "right",
  },
];

const INTERVAL_MS = 5800;

// ─────────────────────────────────────────────────────────────────────────────
//  INJECTED STYLES  (scoped to .ev-hero-*)
// ─────────────────────────────────────────────────────────────────────────────

const HERO_CSS = `
  @keyframes ev-hero-ken {
    0%   { transform: scale(1); }
    100% { transform: scale(1.06); }
  }
  @keyframes ev-hero-copy {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  /* ── Ken-Burns image ── */
  .ev-hero-img-active {
    animation: ev-hero-ken 9s ease-out both;
  }

  /* ── Copy entrance ── */
  .ev-hero-copy {
    animation: ev-hero-copy 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both;
  }

  /* ── SHOP button ── */
  .ev-hero-btn {
    display: inline-block;
    font-family: var(--hero-sans, 'Didact Gothic', sans-serif);
    font-size: 9px;
    letter-spacing: 0.52em;
    text-transform: uppercase;
    color: #f0ebe1;
    background: transparent;
    border: 1px solid rgba(201, 169, 110, 0.75);
    cursor: pointer;
    padding: 15px 42px;
    position: relative;
    overflow: hidden;
    transition: color 0.35s ease, border-color 0.35s ease;
    /* Keeps button text sharp even against any background */
    text-shadow: 0 1px 4px rgba(0,0,0,0.55);
  }

  /* Gold fill that slides in from the left */
  .ev-hero-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #c9a96e;
    transform: translateX(-101%);
    transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
    z-index: 0;
  }
  .ev-hero-btn:hover::before { transform: translateX(0); }
  .ev-hero-btn:hover {
    color: #0a0a08;
    border-color: #c9a96e;
    text-shadow: none;
  }
  .ev-hero-btn span { position: relative; z-index: 1; }

  /* ── Dot indicator ── */
  .ev-dot {
    border: none;
    padding: 0;
    cursor: pointer;
    background: rgba(240, 235, 225, 0.25);
    height: 1px;
    transition: width 0.4s ease, background 0.3s;
    border-radius: 0;
  }
  .ev-dot-active {
    background: #c9a96e;
  }

  /* ── Responsive copy sizing ── */
  @media (max-width: 640px) {
    .ev-hero-title  { font-size: clamp(36px, 11vw, 56px) !important; }
    .ev-hero-sub    { font-size: 13px !important; }
    .ev-hero-copy   { padding: 0 24px !important; max-width: 100% !important; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface HeroProps {
  /** Scroll-to-grid callback wired in the parent */
  onShop: () => void;
}

const Hero: FC<HeroProps> = ({ onShop }) => {
  const [cur, setCur]   = useState(0);
  const timer           = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(
      () => setCur((c) => (c + 1) % SLIDES.length),
      INTERVAL_MS
    );
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [resetTimer]);

  const goTo = (idx: number) => { setCur(idx); resetTimer(); };

  const slide = SLIDES[cur];

  return (
    <>
      <style>{HERO_CSS}</style>

      {/*
        ── Outer shell ──────────────────────────────────────────────────────
        100svh = fills the viewport below the navbar on all devices.
        If you have a fixed navbar of ~68px set paddingTop accordingly.
      */}
      <section
        aria-label="Hero carousel"
        style={{
          position:   "relative",
          width:      "100%",
          height:     "100svh",
          minHeight:  560,
          overflow:   "hidden",
          background: "#0a0a08",
        }}
      >

        {/* ── Image layers ─────────────────────────────────────────────── */}
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            aria-hidden={i !== cur}
            style={{
              position:   "absolute",
              inset:      0,
              zIndex:     i === cur ? 2 : 1,
              opacity:    i === cur ? 1 : 0,
              transition: "opacity 1.15s ease",
            }}
          >
            {/* Photo */}
            <img
              src={s.image}
              alt={s.title.replace("\n", " ")}
              draggable={false}
              className={i === cur ? "ev-hero-img-active" : ""}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center 20%",
                display: "block", userSelect: "none",
              }}
            />

            {/*
              ── Three-layer gradient system ────────────────────────────
              Layer 1 · base dark veil — always-on contrast floor
              Layer 2 · directional gradient — pulls focus toward copy
              Layer 3 · bottom fade — grounds the slide indicator row
            */}

            {/* L1: base veil */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
              background: "rgba(10, 10, 8, 0.38)",
            }} />

            {/* L2: directional */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
              background: s.align === "left"
                ? "linear-gradient(to right, rgba(10,10,8,0.78) 0%, rgba(10,10,8,0.30) 52%, transparent 100%)"
                : "linear-gradient(to left,  rgba(10,10,8,0.78) 0%, rgba(10,10,8,0.30) 52%, transparent 100%)",
            }} />

            {/* L3: bottom fade */}
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 0,
              height: "40%", pointerEvents: "none", zIndex: 3,
              background: "linear-gradient(to top, rgba(10,10,8,0.68) 0%, transparent 100%)",
            }} />
          </div>
        ))}

        {/*
          ── Copy block ────────────────────────────────────────────────────
          Vertically centered with flex. paddingTop: 68px clears a fixed
          navbar — adjust to match your actual nav height.
        */}
        <div
          style={{
            position:      "absolute",
            inset:         0,
            zIndex:        10,
            display:       "flex",
            alignItems:    "center",
            paddingTop:    68,          // ← navbar clearance
            paddingBottom: 80,          // ← keeps away from dot row
          }}
        >
          <div
            key={`copy-${cur}`}
            className="ev-hero-copy"
            style={{
              padding:   `0 clamp(24px, 6vw, 96px)`,
              maxWidth:  560,
              marginLeft:  slide.align === "left"  ? 0 : "auto",
              marginRight: slide.align === "right" ? 0 : "auto",
            }}
          >
            {/* Season label */}
            <p style={{
              fontFamily:    "var(--sans, 'Didact Gothic', sans-serif)",
              fontSize:      8,
              letterSpacing: "0.64em",
              textTransform: "uppercase",
              color:         "#c9a96e",
              margin:        "0 0 18px",
              textShadow:    "0 1px 6px rgba(0,0,0,0.6)",
            }}>
              {slide.label}
            </p>

            {/* Headline ── highest contrast element on the page */}
            <h1
              className="ev-hero-title"
              style={{
                fontFamily:    "var(--serif, 'Playfair Display', Georgia, serif)",
                fontSize:      "clamp(46px, 7.5vw, 96px)",
                fontWeight:    400,
                lineHeight:    0.93,
                letterSpacing: "-0.02em",
                color:         "#f0ebe1",
                margin:        "0 0 22px",
                whiteSpace:    "pre-line",
                // Three-value shadow: soft spread + tight crisp layer
                textShadow:    "0 2px 18px rgba(0,0,0,0.65), 0 1px 4px rgba(0,0,0,0.90)",
              }}
            >
              {slide.title}
            </h1>

            {/* Subline */}
            <p
              className="ev-hero-sub"
              style={{
                fontFamily:    "var(--serif, 'Playfair Display', Georgia, serif)",
                fontStyle:     "italic",
                fontSize:      15,
                lineHeight:    1.55,
                color:         "rgba(240,235,225,0.72)",
                margin:        "0 0 38px",
                textShadow:    "0 2px 10px rgba(0,0,0,0.55)",
              }}
            >
              {slide.sub}
            </p>

            {/* CTA button — outlined gold → solid gold on hover */}
            <button className="ev-hero-btn" onClick={onShop}>
              <span>{slide.cta}</span>
            </button>
          </div>
        </div>

        {/* ── Slide indicator dots ─────────────────────────────────────── */}
        <div
          style={{
            position:  "absolute",
            zIndex:    11,
            bottom:    28,
            left:      "50%",
            transform: "translateX(-50%)",
            display:   "flex",
            gap:       10,
            alignItems: "center",
          }}
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`ev-dot ${i === cur ? "ev-dot-active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{ width: i === cur ? 28 : 5 }}
            />
          ))}
        </div>

        {/* ── Slide counter ────────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position:      "absolute",
            zIndex:        11,
            bottom:        22,
            right:         "clamp(16px, 5vw, 48px)",
            fontFamily:    "var(--sans, 'Didact Gothic', sans-serif)",
            fontSize:       8,
            letterSpacing:  "0.4em",
            color:          "rgba(240,235,225,0.2)",
          }}
        >
          {String(cur + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </div>

      </section>
    </>
  );
};

export default Hero;