// ═══════════════════════════════════════════════════════════════════════════
//  Home.tsx · Élvar Clothing · Full Homepage with Hero Image Integration
// ═══════════════════════════════════════════════════════════════════════════

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  FC,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PhilosophySection from "../components/PhilosophySection";
import { ProductPrice } from "../components/ProductPrice";
import { apiUrl, getImageUrl } from "../config/api";

// ── IMPORT HERO IMAGES DIRECTLY FROM SRC/IMAGES ───────────────────────────
import hero1 from "../images/hero1.png";
import hero2 from "../images/hero2.png";
import hero3 from "../images/hero3.png";

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface StockItem { size: string; quantity: number; }

interface Product {
  id:                   number;
  title:                string;
  description:          string | null;
  price:                number;
  original_price?:      number;
  current_price?:       number;
  is_discount_active?:  boolean;
  discount_percentage?: number;
  category:             string;
  image_url:            string | null;
  stock:                StockItem[] | null;
}

type SortKey = "newest" | "price_asc" | "price_desc" | "alpha";

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80&auto=format&fit=crop";

// Sentinel value: null means "no price ceiling" — avoids floating-point
// equality traps that can occur with Infinity comparisons inside useMemo.
const NO_MAX_PRICE = null as null;

const PRICE_BRACKETS: { label: string; max: number | null }[] = [
  { label: "Any price",        max: NO_MAX_PRICE },
  { label: "Under LKR 5,000",  max: 5000         },
  { label: "Under LKR 10,000", max: 10000        },
  { label: "Under LKR 25,000", max: 25000        },
  { label: "Under LKR 50,000", max: 50000        },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest",     label: "Newest"  },
  { value: "price_asc",  label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "alpha",      label: "A – Z"   },
];

// Sentinel string used for the "show everything" filter state.
// Kept as a named constant to eliminate "All" === "All" magic-string comparisons.
const ALL_CATEGORY = "All" as const;

// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Didact+Gothic&display=swap');

  :root {
    --ink:    #0a0a08;
    --bone:   #f0ebe1;
    --gold:   #c9a96e;
    --surf:   #111110;
    --line:   rgba(240,235,225,0.08);
    --serif:  'Playfair Display', Georgia, serif;
    --sans:   'Didact Gothic', 'Helvetica Neue', sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; }
  button { font-family: inherit; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }

  .skel {
    background: linear-gradient(90deg, #181816 25%, #222220 50%, #181816 75%);
    background-size: 600px 100%;
    animation: shimmer 1.5s infinite linear;
    border-radius: 2px;
  }

  .pcard               { cursor: pointer; }
  .pcard:focus-visible { outline: 1px solid var(--gold); outline-offset: 3px; }
  .pcard-img  { transition: transform 0.85s cubic-bezier(0.25,0.46,0.45,0.94); }
  .pcard:hover .pcard-img  { transform: scale(1.05); }
  .pcard-veil { transition: opacity 0.32s ease; }
  .pcard:hover .pcard-veil { opacity: 1 !important; }

  .ev-select {
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 8 5'%3E%3Cpath d='M1 1l3 3 3-3' stroke='%23c9a96e' stroke-width='1.2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    padding-right: 22px !important;
    cursor: pointer;
  }

  .no-sb::-webkit-scrollbar { display: none; }
  .no-sb { -ms-overflow-style: none; scrollbar-width: none; }

  .feat-cell { transition: background 0.3s; }
  .feat-cell:hover { background: rgba(201,169,110,0.04) !important; }
  .feat-icon { transition: color 0.3s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1); }
  .feat-cell:hover .feat-icon {
    color: var(--gold) !important;
    transform: translateY(-3px);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const toSrc = (u: string | null) => getImageUrl(u) || FALLBACK;

/** Capitalise first char, lowercase the rest. */
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/**
 * Normalise a category value to a trimmed lowercase string.
 * Returns "" for any nullish / whitespace-only input.
 */
const normCat = (value: string | undefined | null): string =>
  (value ?? "").trim().toLowerCase();

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const stockQty = (s: StockItem[] | null): number =>
  (s ?? []).reduce((acc, item) => acc + item.quantity, 0);

const effectivePrice = (p: Product): number => p.current_price ?? p.price;

const sortProducts = (arr: Product[], key: SortKey): Product[] => {
  const c = [...arr];
  switch (key) {
    case "price_asc":  return c.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    case "price_desc": return c.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    case "alpha":      return c.sort((a, b) => a.title.localeCompare(b.title));
    default:           return c; // "newest" — preserve API insertion order
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  DEBUG UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 🔍 DEBUG TRACE: Log API response structure and product extraction.
 * Enable this by calling: window.DEBUG_API = true; in DevTools console.
 */
const debugApiResponse = (data: unknown, context: string = "API Response"): void => {
  if (!(window as any).DEBUG_API) return;
  
  console.group(`🔍 [Home] ${context}`);
  console.log("Raw response:", data);
  console.log("Type:", typeof data);
  console.log("Is array?", Array.isArray(data));
  console.log("Keys:", Object.keys(data ?? {}));
  
  if (data && typeof data === "object" && "success" in data) {
    console.log("success:", (data as any).success);
    console.log("products array?", Array.isArray((data as any).products));
    console.log("products length:", (data as any).products?.length ?? 0);
    if ((data as any).products?.[0]) {
      console.log("First product keys:", Object.keys((data as any).products[0]));
      console.log("First product:", (data as any).products[0]);
    }
  }
  console.groupEnd();
};

// Enable debug mode in console: window.DEBUG_API = true;
(window as any).DEBUG_API = false;

// ─────────────────────────────────────────────────────────────────────────────
//  HERO COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface HeroProps { onShop: () => void; }

const Hero: FC<HeroProps> = ({ onShop }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    { image: hero1, tag: "The Island Campaign", title: "Tradition Meets Luxury"  },
    { image: hero2, tag: "Resort Editorial",     title: "Crafted With Intention" },
    { image: hero3, tag: "The Colombo Flagship", title: "The Retail Experience"  },
  ];

  useEffect(() => {
    const timer = setInterval(
      () => setActiveSlide((prev) => (prev + 1) % slides.length),
      5000,
    );
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[85vh] min-h-[580px] bg-[#0d0d0c] overflow-hidden flex items-center">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${idx === activeSlide ? "opacity-40 scale-100" : "opacity-0 scale-[1.03]"}`}
          style={{ transitionProperty: "opacity, transform" }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a08] via-transparent to-[rgba(10,10,8,0.5)] pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center sm:text-left">
        <span
          className="inline-block text-[var(--gold)] text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.6em] mb-4 opacity-80 transition-all duration-700 transform translate-y-0"
          style={{ fontFamily: "var(--sans)" }}
        >
          {slides[activeSlide].tag}
        </span>
        <h1
          className="text-[38px] sm:text-[54px] md:text-[72px] lg:text-[84px] font-normal leading-[1.1] tracking-[-0.03em] text-[var(--bone)] max-w-2xl mb-8 transition-all duration-700"
          style={{ fontFamily: "var(--serif)" }}
        >
          {slides[activeSlide].title}
        </h1>
        <button
          onClick={onShop}
          className="group inline-flex items-center gap-4 bg-transparent border border-[rgba(240,235,225,0.2)] hover:border-[var(--gold)] px-8 py-4 rounded-full text-[var(--bone)] hover:text-[var(--gold)] transition-all duration-300 backdrop-blur-sm cursor-pointer"
        >
          <span className="text-[0.6rem] uppercase tracking-[0.45em]">Explore Collection</span>
          <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
      </div>

      <div className="absolute bottom-8 right-4 sm:right-8 lg:right-12 flex gap-2.5 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className={`h-1 rounded-full transition-all duration-500 bg-[var(--gold)] ${idx === activeSlide ? "w-6 opacity-100" : "w-1.5 opacity-25"}`}
          />
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  SKELETON CARD
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonCard: FC<{ delay?: number }> = ({ delay = 0 }) => (
  <div style={{ opacity: 0, animation: `fadeIn 0.4s ease ${delay}ms both` }}>
    <div className="skel" style={{ aspectRatio: "3/4", width: "100%", marginBottom: 12 }} />
    <div className="skel" style={{ height: 6,  width: "36%", marginBottom: 8 }} />
    <div className="skel" style={{ height: 12, width: "70%", marginBottom: 8 }} />
    <div className="skel" style={{ height: 9,  width: "28%" }} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  PRODUCT CARD
// ─────────────────────────────────────────────────────────────────────────────

const ProductCard: FC<{ product: Product; index: number }> = ({ product, index }) => {
  const navigate      = useNavigate();
  const [err, setErr] = useState(false);
  const qty           = stockQty(product.stock);
  const sizes         = (product.stock ?? []).filter((s) => s.quantity > 0).map((s) => s.size);
  const delay         = Math.min(index * 50, 460);

  return (
    <article
      className="pcard w-full"
      role="button"
      tabIndex={0}
      aria-label={`View ${product.title}`}
      onClick={() => navigate(`/product/${product.id}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${product.id}`)}
      style={{ opacity: 0, animation: `fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` }}
    >
      <div className="relative overflow-hidden aspect-[3/4] w-full md:max-h-[540px] bg-[var(--surf)]">
        <img
          src={err ? FALLBACK : toSrc(product.image_url)}
          alt={product.title}
          onError={() => setErr(true)}
          loading="lazy"
          className="pcard-img"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
            display: "block",
          }}
        />
        <div
          className="pcard-veil"
          style={{
            position: "absolute", inset: 0, opacity: 0,
            background: "rgba(10,10,8,0.46)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div style={{ border: "1px solid rgba(240,235,225,0.42)", padding: "12px 26px" }}>
            <span style={{ fontFamily: "var(--sans)", fontSize: 7, letterSpacing: "0.52em", textTransform: "uppercase", color: "var(--bone)" }}>
              View Piece
            </span>
          </div>
        </div>

        {qty === 0 ? (
          <div style={{ position: "absolute", top: 10, left: 10, padding: "4px 9px", background: "rgba(10,10,8,0.78)", backdropFilter: "blur(4px)" }}>
            <span style={{ fontFamily: "var(--sans)", fontSize: 7, letterSpacing: "0.36em", textTransform: "uppercase", color: "rgba(240,235,225,0.24)" }}>Sold Out</span>
          </div>
        ) : qty <= 5 ? (
          <div style={{ position: "absolute", top: 10, left: 10, padding: "4px 9px", background: "var(--gold)" }}>
            <span style={{ fontFamily: "var(--sans)", fontSize: 7, letterSpacing: "0.36em", textTransform: "uppercase", color: "#0a0a08", fontWeight: 600 }}>Last Few</span>
          </div>
        ) : null}
      </div>

      <div style={{ paddingTop: 12 }}>
        <p style={{ fontFamily: "var(--sans)", fontSize: 7, letterSpacing: "0.44em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 4px" }}>
          {cap(product.category)}
        </p>
        <h3 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 15, lineHeight: 1.2, color: "var(--bone)", margin: "0 0 6px" }}>
          {product.title}
        </h3>
        <div className="mb-2">
          {/* ProductPrice handles all LKR formatting internally */}
          <ProductPrice product={product} className="font-[var(--serif)] text-[var(--bone)]" />
        </div>
        {sizes.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {sizes.slice(0, 5).map((s) => (
              <span
                key={s}
                style={{ fontFamily: "var(--sans)", fontSize: 7, padding: "2px 6px", border: "1px solid rgba(240,235,225,0.1)", color: "rgba(240,235,225,0.2)", letterSpacing: "0.08em" }}
              >
                {s}
              </span>
            ))}
            {sizes.length > 5 && (
              <span style={{ fontFamily: "var(--sans)", fontSize: 7, color: "rgba(240,235,225,0.15)" }}>
                +{sizes.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  FILTER BAR
// ─────────────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  categories:  string[];
  active:      string;
  sort:        SortKey;
  maxPrice:    number | null;
  inStock:     boolean;
  count:       number;
  onCategory:  (c: string) => void;
  onSort:      (s: SortKey) => void;
  onMaxPrice:  (n: number | null) => void;
  onInStock:   (b: boolean) => void;
}

const FilterBar: FC<FilterBarProps> = ({
  categories, active, sort, maxPrice, inStock, count,
  onCategory, onSort, onMaxPrice, onInStock,
}) => {
  const [priceOpen, setPriceOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setPriceOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const priceLabel =
    PRICE_BRACKETS.find((b) => b.max === maxPrice)?.label ?? "Any price";

  return (
    <div className="sticky top-24 z-20 bg-[rgba(10,10,8,0.97)] backdrop-blur-xl border-b border-[var(--line)]">
      <div className="no-sb mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 overflow-x-auto">

        {/* ── Category pills ── */}
        <nav className="flex flex-wrap items-center gap-2" aria-label="Category filter">
          {[ALL_CATEGORY, ...categories].map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategory(cat)}
                className={`inline-flex items-center border-b-2 pb-0.5 text-[0.625rem] uppercase tracking-[0.4em] transition ${
                  isActive
                    ? "border-[var(--gold)] text-[var(--bone)]"
                    : "border-transparent text-[rgba(240,235,225,0.24)]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </nav>

        {/* ── Controls row ── */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-5 flex-shrink-0 py-2">

          {/* In-stock toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              role="switch"
              aria-checked={inStock}
              onClick={() => onInStock(!inStock)}
              className={`relative flex h-3.5 w-7 rounded-full transition ${inStock ? "bg-[var(--gold)]" : "bg-[rgba(240,235,225,0.1)]"}`}
            >
              <span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-[#f0ebe1] shadow-sm transition-all ${inStock ? "left-3.5" : "left-0.5"}`} />
            </div>
            <span className={`font-[var(--sans)] text-[0.625rem] uppercase tracking-[0.32em] transition ${inStock ? "text-[var(--gold)]" : "text-[rgba(240,235,225,0.26)]"}`}>
              In Stock
            </span>
          </label>

          {/* Price dropdown */}
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setPriceOpen((o) => !o)}
              className={`inline-flex items-center gap-2 text-[0.625rem] uppercase tracking-[0.3em] transition ${maxPrice !== NO_MAX_PRICE ? "text-[var(--gold)]" : "text-[rgba(240,235,225,0.28)]"}`}
            >
              {priceLabel}
              <svg width="7" height="5" viewBox="0 0 7 5" fill="none" className={`transition-transform ${priceOpen ? "rotate-180" : "rotate-0"}`}>
                <path d="M1 1l2.5 3L6 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
            {priceOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] z-50 min-w-[185px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[#111110] shadow-[0_18px_40px_rgba(0,0,0,0.55)] animate-fadeIn">
                {PRICE_BRACKETS.map((b) => (
                  <button
                    key={b.label}
                    onClick={() => { onMaxPrice(b.max); setPriceOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-[0.625rem] uppercase tracking-[0.26em] transition ${maxPrice === b.max ? "text-[var(--gold)] bg-[rgba(201,169,110,0.06)]" : "text-[rgba(240,235,225,0.35)]"}`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span style={{ width: 1, height: 20, background: "var(--line)", flexShrink: 0 }} />

          {/* Sort select */}
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as SortKey)}
            className="ev-select"
            style={{
              fontFamily: "var(--sans)", fontSize: 8, letterSpacing: "0.28em",
              textTransform: "uppercase", color: "rgba(240,235,225,0.35)",
              background: "transparent", border: "none", outline: "none",
              padding: "4px 22px 4px 0",
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ background: "#111110", color: "#f0ebe1" }}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Result count */}
          <span style={{ fontFamily: "var(--sans)", fontSize: 7, letterSpacing: "0.36em", textTransform: "uppercase", color: "rgba(240,235,225,0.16)", whiteSpace: "nowrap" }}>
            {count} {count === 1 ? "item" : "items"}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  FEATURES STRIP
// ─────────────────────────────────────────────────────────────────────────────

const FEAT_ITEMS = [
  {
    tag: "Complimentary", title: "Free Returns",
    desc: "14-day door-to-door collection. Your satisfaction, unconditionally guaranteed.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h18M3 7l2 12h14l2-12M3 7L12 2l9 5"/><path d="M9.5 11v5M14.5 11v5"/>
      </svg>
    ),
  },
  {
    tag: "Guaranteed", title: "Hand-Inspected",
    desc: "Every piece passes our artisan quality check — flawless or it never ships.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l2.3 7H22l-5.9 4.3 2.3 7L12 17.3 5.6 21.3l2.3-7L2 10h7.7z"/>
      </svg>
    ),
  },
  {
    tag: "256-bit SSL", title: "Secure Payment",
    desc: "Bank-grade encryption. Multiple trusted gateways — pay the way you prefer.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="11" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>
        <circle cx="12" cy="16.5" r="1.2" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
];

const FeaturesStrip: FC = () => (
  <section className="bg-[var(--ink)] border-t border-[var(--line)]">
    <div className="mx-auto grid max-w-7xl gap-3 px-4 py-16 sm:px-6 lg:px-8 lg:grid-cols-3">
      {FEAT_ITEMS.map((f, i) => (
        <div
          key={f.title}
          className={`feat-cell flex flex-col gap-4 px-6 py-8 ${i > 0 ? "border-t border-[var(--line)] sm:border-t-0 sm:border-l" : ""}`}
        >
          <div className="feat-icon" style={{ color: "rgba(240,235,225,0.28)", display: "inline-block" }}>{f.icon}</div>
          <div>
            <p style={{ fontFamily: "var(--sans)", fontSize: 7, letterSpacing: "0.52em", textTransform: "uppercase", color: "rgba(240,235,225,0.2)", margin: "0 0 7px" }}>{f.tag}</p>
            <h3 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 17, color: "var(--bone)", margin: "0 0 8px", lineHeight: 1.2 }}>{f.title}</h3>
            <p style={{ fontFamily: "var(--sans)", fontSize: 11, lineHeight: 1.85, color: "rgba(240,235,225,0.35)", margin: 0 }}>{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
//  NEWSLETTER SECTION
// ─────────────────────────────────────────────────────────────────────────────

const STYLES_NL = `
  .nl-inp {
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(240,235,225,0.14);
    outline: none;
    color: var(--bone);
    font-family: var(--sans);
    font-size: 11px;
    letter-spacing: 0.1em;
    padding: 12px 0;
    width: 100%;
    transition: border-color 0.25s;
  }
  .nl-inp::placeholder { color: rgba(240,235,225,0.2); }
  .nl-inp:focus        { border-bottom-color: var(--gold); }
`;

const NewsletterSection: FC = () => {
  const [email, setEmail]           = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const submit = () => {
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  };

  return (
    <section className="bg-[#080806] border-y border-[var(--line)] py-24 px-4 sm:px-6 lg:px-8">
      <style>{STYLES_NL}</style>
      <div className="mx-auto max-w-3xl text-center">
        <p style={{ fontFamily: "var(--sans)", fontSize: 8, letterSpacing: "0.7em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 18px" }}>
          Stay Informed
        </p>
        <h2 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "clamp(26px, 3.5vw, 40px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--bone)", margin: "0 0 14px" }}>
          First access, always.
        </h2>
        <p style={{ fontFamily: "var(--sans)", fontSize: 11, lineHeight: 1.85, color: "rgba(240,235,225,0.3)", margin: "0 0 42px" }}>
          New arrivals, private sales, and editorial drops —
          delivered before anyone else.
        </p>
        {subscribed ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--sans)", fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(240,235,225,0.36)" }}>
              You're on the list
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "stretch", gap: 0, maxWidth: 440, margin: "0 auto" }}>
            <input
              type="email"
              className="nl-inp"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              style={{ flex: 1 }}
            />
            <button
              onClick={submit}
              style={{
                fontFamily: "var(--sans)", fontSize: 8, letterSpacing: "0.46em",
                textTransform: "uppercase", color: "#0a0a08", background: "var(--bone)",
                border: "none", cursor: "pointer", padding: "0 26px", marginLeft: 16,
                flexShrink: 0, whiteSpace: "nowrap", transition: "background 0.28s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--gold)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bone)"; }}
            >
              Subscribe
            </button>
          </div>
        )}
        <p style={{ fontFamily: "var(--sans)", fontSize: 9, letterSpacing: "0.12em", color: "rgba(240,235,225,0.14)", margin: "20px 0 0" }}>
          No spam. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  HOME PAGE
// ─────────────────────────────────────────────────────────────────────────────

const Home: FC = () => {
  const [searchParams]   = useSearchParams();
  const searchQuery      = searchParams.get("search")   ?? "";
  const categoryParam    = searchParams.get("category") ?? "";
  const gridRef          = useRef<HTMLDivElement>(null);
  const navigate         = useNavigate();

  const [products,       setProducts]       = useState<Product[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [sort,           setSort]           = useState<SortKey>("newest");
  const [maxPrice,       setMaxPrice]       = useState<number | null>(NO_MAX_PRICE);
  const [inStock,        setInStock]        = useState(false);

  // 🔍 DEBUG MODE: Enable in DevTools console with:
  //    window.DEBUG_API = true;
  // Then refresh page to see detailed logging of API responses and category extraction.

  // ── Sync activeCategory from URL param ──────────────────────────────────
  // Use cap(normCat(...)) so both the pill buttons and this state always
  // carry the same "Title-cased" representation e.g. "Shirts", "Accessories".
  // Fall back to the ALL_CATEGORY sentinel when the param is absent.
  useEffect(() => {
    setActiveCategory(
      categoryParam ? cap(normCat(categoryParam)) : ALL_CATEGORY,
    );
  }, [categoryParam]);

  // ── Fetch products ───────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (searchQuery)   qs.set("search",   searchQuery);
      if (categoryParam) qs.set("category", categoryParam);
      const url = qs.toString()
        ? apiUrl(`/api/products?${qs}`)
        : apiUrl(`/api/products`);

      console.log("[Home] 🚀 Fetching from:", url);
      const res  = await fetch(url);
      
      // Check HTTP response status first
      if (!res.ok) {
        console.error("[Home] ❌ HTTP Error:", res.status, res.statusText);
        setProducts([]);
        return;
      }

      const data = await res.json();
      
      // 🔍 DEBUG: Log the raw response
      debugApiResponse(data, "Raw API Response");
      
      // ┌─ SAFE EXTRACTION WITH FALLBACKS ────────────────────────────────────
      // Try standard structure first: { success: true, products: [...] }
      let extractedProducts: Product[] | null = null;
      
      if (data && typeof data === "object") {
        // Try standard response structure
        if (data.success === true && Array.isArray(data.products)) {
          extractedProducts = data.products;
          console.log("[Home] ✓ Extracted from standard structure (data.products)");
        }
        // Fallback: Try data.data array
        else if (Array.isArray(data.data)) {
          extractedProducts = data.data;
          console.log("[Home] ✓ Extracted from fallback structure (data.data)");
        }
        // Fallback: Response is array itself
        else if (Array.isArray(data)) {
          extractedProducts = data;
          console.log("[Home] ✓ Extracted from direct array structure");
        }
      }
      
      // ┌─ VALIDATION ────────────────────────────────────────────────────────
      if (extractedProducts === null) {
        console.warn("[Home] ⚠ Could not extract products array from response:", data);
        setProducts([]);
        return;
      }
      
      if (!Array.isArray(extractedProducts)) {
        console.warn("[Home] ⚠ Extracted value is not an array:", typeof extractedProducts);
        setProducts([]);
        return;
      }
      
      // ┌─ SAFE PRODUCT MAPPING ──────────────────────────────────────────────
      // Ensure each product has required fields, with safe fallbacks for missing discount data
      const safeProducts = extractedProducts.map((p: any) => ({
        id: p?.id ?? 0,
        title: p?.title ?? "Unknown Product",
        description: p?.description ?? null,
        price: p?.price ?? p?.original_price ?? 0,  // Fallback to original_price if price missing
        original_price: p?.original_price ?? p?.price ?? 0,
        current_price: p?.current_price ?? p?.price ?? 0,  // Use price if current_price missing
        is_discount_active: p?.is_discount_active ?? false,  // Default to false if missing
        discount_percentage: p?.discount_percentage ?? 0,
        category: p?.category ?? "Uncategorized",
        image_url: p?.image_url ?? null,
        stock: Array.isArray(p?.stock) ? p.stock : null,
      })) as Product[];
      
      console.log("[Home] ✓ Successfully mapped", safeProducts.length, "products with safe fallbacks");
      
      if (safeProducts.length === 0) {
        console.warn("[Home] ⚠ No products returned from API");
      } else {
        console.log("[Home] 📦 First product sample:", safeProducts[0]);
      }
      
      setProducts(safeProducts);
    } catch (err) {
      console.error("[Home] ❌ fetchProducts error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryParam]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Derive unique category labels from the product list ─────────────────
  // We normalise to lowercase first (deduplication), then cap() for display.
  // SAFE: Only run after confirming products array is populated.
  const categories = useMemo<string[]>(() => {
    // Guard: No products yet, return empty categories
    if (!Array.isArray(products) || products.length === 0) {
      console.log("[Home] 📋 No products to extract categories from");
      return [];
    }

    const seen = new Set<string>();
    const result: string[] = [];
    
    try {
      for (const p of products) {
        // Use optional chaining to safely access category
        const catValue = p?.category ?? "Uncategorized";
        const normalized = normCat(catValue);
        
        if (normalized && !seen.has(normalized)) {
          seen.add(normalized);
          result.push(cap(normalized));   // e.g. "shirts" → "Shirts"
        }
      }
    } catch (err) {
      console.error("[Home] Error extracting categories:", err);
      return [];
    }
    
    console.log("[Home] 📋 Extracted", result.length, "categories:", result);
    return result;
  }, [products]);

  // ── Main filter + sort pipeline ─────────────────────────────────────────
  const visible = useMemo<Product[]>(() => {
    // Guard: nothing to filter yet.
    if (products.length === 0) return [];

    console.group("[Home] Filter pipeline");
    console.log("  Input:", products.length, "products");
    console.log("  State → category:", activeCategory, "| search:", searchQuery, "| inStock:", inStock, "| maxPrice:", maxPrice, "| sort:", sort);

    // ── Step 1: category ──────────────────────────────────────────────────
    // Normalise BOTH sides to lowercase so "All" / "all" / "Shirts" / "shirts"
    // comparisons are reliable regardless of what the API returns.
    const activeLower = normCat(activeCategory);
    const afterCategory = activeLower === normCat(ALL_CATEGORY)
      ? products
      : products.filter((p) => normCat(p.category) === activeLower);

    console.log("  After category filter:", afterCategory.length);

    // ── Step 2: search query ──────────────────────────────────────────────
    const queryLower = searchQuery.trim().toLowerCase();
    const afterSearch = queryLower
      ? afterCategory.filter((p) =>
          p.title.toLowerCase().includes(queryLower) ||
          (p.description ?? "").toLowerCase().includes(queryLower),
        )
      : afterCategory;

    console.log("  After search filter:", afterSearch.length);

    // ── Step 3: in-stock ──────────────────────────────────────────────────
    const afterStock = inStock
      ? afterSearch.filter((p) => stockQty(p.stock) > 0)
      : afterSearch;

    console.log("  After stock filter:", afterStock.length);

    // ── Step 4: price ceiling ─────────────────────────────────────────────
    // maxPrice === null means "no ceiling" — avoids Infinity comparison traps.
    const afterPrice = maxPrice !== null
      ? afterStock.filter((p) => effectivePrice(p) <= maxPrice)
      : afterStock;

    console.log("  After price filter:", afterPrice.length);

    // ── Step 5: sort ──────────────────────────────────────────────────────
    const sorted = sortProducts(afterPrice, sort);

    console.log("  Final visible:", sorted.length);
    console.groupEnd();

    return sorted;
  }, [products, activeCategory, searchQuery, inStock, maxPrice, sort]);

  const scrollToGrid = () =>
    gridRef.current?.scrollIntoView({ behavior: "smooth" });

  // ── Reset all client-side filters (does NOT re-fetch) ───────────────────
  const clearFilters = () => {
    setActiveCategory(categoryParam ? cap(normCat(categoryParam)) : ALL_CATEGORY);
    setMaxPrice(NO_MAX_PRICE);
    setInStock(false);
  };

  return (
    <>
      <style>{STYLES}</style>

      <div className="min-h-screen bg-[var(--ink)] text-[var(--bone)] overflow-x-hidden">

        {/* ── Hero Slideshow ── */}
        {!searchQuery && <Hero onShop={scrollToGrid} />}

        {/* ── Search header ── */}
        {searchQuery && (
          <header className="border-b border-[var(--line)] px-4 py-14 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <p className="font-[var(--sans)] text-[0.625rem] tracking-[0.55em] uppercase text-[var(--gold)] mb-3">
                Search Results
              </p>
              <h1 className="font-[var(--serif)] font-normal text-[clamp(28px,5vw,58px)] leading-tight text-[var(--bone)] mb-3">
                &ldquo;{searchQuery}&rdquo;
              </h1>
              <p className="font-[var(--sans)] text-[0.625rem] uppercase tracking-[0.3em] text-[rgba(240,235,225,0.3)]">
                {visible.length} {visible.length === 1 ? "piece" : "pieces"} found
              </p>
            </div>
          </header>
        )}

        {/* ── Filter bar ── */}
        <div ref={gridRef}>
          <FilterBar
            categories={categories}
            active={activeCategory}
            sort={sort}
            maxPrice={maxPrice}
            inStock={inStock}
            count={visible.length}
            onCategory={setActiveCategory}
            onSort={setSort}
            onMaxPrice={setMaxPrice}
            onInStock={setInStock}
          />
        </div>

        {/* ── Product grid ── */}
        <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-[var(--sans)] text-[0.625rem] tracking-[0.52em] uppercase text-[var(--gold)] mb-2">Collection</p>
              <h2 className="font-[var(--serif)] font-normal text-[clamp(24px,3vw,40px)] leading-tight text-[var(--bone)]">
                {activeCategory === ALL_CATEGORY ? "All Pieces" : activeCategory}
              </h2>
            </div>
            <button
              onClick={() => navigate(`/collection/${slugify(activeCategory === ALL_CATEGORY ? "all" : activeCategory)}`)}
              className="inline-flex items-center gap-2 border border-[rgba(240,235,225,0.1)] bg-transparent px-5 py-3 rounded-full text-[0.625rem] uppercase tracking-[0.42em] text-[rgba(240,235,225,0.36)] transition hover:border-[rgba(201,169,110,0.5)] hover:text-[var(--gold)]"
            >
              See All <span className="text-base leading-none">→</span>
            </button>
          </div>

          {/* ── Grid states ── */}
          {loading ? (
            // State 1: data is in flight → show skeletons
            <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} delay={i * 55} />
              ))}
            </div>

          ) : products.length === 0 ? (
            // State 2: fetch completed but the API returned zero products
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-0">
              <span className="text-[var(--gold)] text-lg">✦</span>
              <p className="font-[var(--serif)] italic text-2xl text-[rgba(240,235,225,0.58)]">No products available</p>
              <p className="font-[var(--sans)] text-[0.75rem] uppercase tracking-[0.32em] text-[rgba(240,235,225,0.28)]">
                We're currently updating our collection. Please check back soon.
              </p>
            </div>

          ) : visible.length === 0 ? (
            // State 3: products exist but none survive the current filters
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-0">
              <span className="text-[var(--gold)] text-lg">✦</span>
              <p className="font-[var(--serif)] italic text-2xl text-[rgba(240,235,225,0.58)]">Nothing found</p>
              <p className="font-[var(--sans)] text-[0.75rem] uppercase tracking-[0.32em] text-[rgba(240,235,225,0.28)]">
                {searchQuery ? "Try a broader search term" : "Adjust your filters"}
              </p>
              <button
                onClick={clearFilters}
                className="rounded-full border border-[rgba(240,235,225,0.12)] bg-transparent px-8 py-3 text-[0.625rem] uppercase tracking-[0.42em] text-[rgba(240,235,225,0.38)] transition hover:border-[rgba(201,169,110,0.4)] hover:text-[var(--gold)]"
              >
                Clear Filters
              </button>
            </div>

          ) : (
            // State 4: happy path
            <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-10">
              {visible.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </main>

        {/*
          ── Global sections rendered unconditionally (outside the grid
             state machine above) so they always appear once loading
             is complete, regardless of filter results.
        ── */}
        {!loading && (
          <>
            <FeaturesStrip />

            {/*
              id="philosophy" lives here so the scroll-margin offset
              accounts for the fixed navbar (68 px) + any announcement
              bar (32 px) without hiding the heading.
            */}
            <section id="philosophy" style={{ scrollMarginTop: 100 }}>
              <PhilosophySection />
            </section>

            <NewsletterSection />
          </>
        )}

      </div>
    </>
  );
};

export default Home;