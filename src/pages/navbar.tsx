// ═══════════════════════════════════════════════════════════════════════════
//  NavBar.tsx · Élvar Clothing · Luxury Navigation
//  Aesthetic: Editorial-minimal — ink-black, bone-white, gold accent
//  Features: Dynamic search (fixed dropdown), About Us hash scroll, cart badge
// ═══════════════════════════════════════════════════════════════════════════

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  FC,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { apiUrl } from "../config/api";

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface NavBarProps {
  onCartClick?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
//  SVG ICONS
// ─────────────────────────────────────────────────────────────────────────────

const SearchIcon: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const CartIcon: FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const CloseIcon: FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronDown: FC<{ size?: number; open?: boolean }> = ({ size = 10, open }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    style={{ transition: "transform 0.3s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const NavBar: FC<NavBarProps> = ({ onCartClick }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { cartItems } = useCart() as any;
  const navigate      = useNavigate();
  const location      = useLocation();

  // ── State ────────────────────────────────────────────────────────────────
  const [scrolled,    setScrolled]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [catOpen,     setCatOpen]     = useState(false);
  const [categories,  setCategories]  = useState<string[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);
  const catRef    = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  // ── Cart count ───────────────────────────────────────────────────────────
  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((acc: number, item: { quantity?: number }) => acc + (item.quantity ?? 1), 0)
    : 0;

  // ── Scroll detection ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ── Fetch categories ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(apiUrl(`/api/products`));
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          const unique = Array.from(
            new Set<string>(
              data.products.map((p: { category: string }) =>
                p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase()
              )
            )
          );
          setCategories(unique);
        }
      } catch {
        // silently fail
      }
    })();
  }, []);

  // ── Close category dropdown on outside click ──────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Close search dropdown on outside click ────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Close all on route change ─────────────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname, location.search]);

  // ── Search handlers ───────────────────────────────────────────────────────
  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 80);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      closeSearch();
      setMobileOpen(false);  // Close mobile menu after search
    },
    [searchQuery, navigate, closeSearch]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    console.log("[Navbar] search input:", value);
  }, []);

  // ── Category navigation ───────────────────────────────────────────────────
  const handleCategoryClick = (cat: string) => {
    const target = cat === "All Products" ? "/" : `/?category=${encodeURIComponent(cat)}`;
    navigate(target);
    setCatOpen(false);
    setMobileOpen(false);
  };

  // ── FIX: About Us hash scroll — works on same page AND cross-page ─────────
  const handleAboutClick = useCallback(() => {
    if (location.pathname === "/") {
      // Already on home page — scroll directly
      const el = document.getElementById("philosophy");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Navigate to home first, then scroll after the page mounts
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById("philosophy");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    }
    setMobileOpen(false);
  }, [location.pathname, navigate]);

  // ── Shared nav link style ─────────────────────────────────────────────────
  const navLinkStyle: React.CSSProperties = {
    fontFamily: "'Didact Gothic', 'Helvetica Neue', sans-serif",
    fontSize: 9,
    letterSpacing: "0.45em",
    textTransform: "uppercase",
    color: "rgba(240,235,225,0.45)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 0",
    textDecoration: "none",
    transition: "color 0.25s",
    display: "inline-flex",
    alignItems: "center",
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Didact+Gothic&display=swap');

        .ev-nav-link:hover      { color: #f0ebe1 !important; }
        .ev-nav-link-gold:hover { color: #c9a96e !important; }

        @keyframes ev-slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ev-slide-right {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ev-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .ev-search-dropdown { animation: ev-slide-down 0.22s ease both; }
        .ev-mobile-menu     { animation: ev-slide-right 0.38s cubic-bezier(0.22,1,0.36,1) both; }
        .ev-cat-dropdown    { animation: ev-slide-down 0.22s ease both; }
        .ev-cart-badge      { animation: ev-fade-in 0.3s ease both; }

        @media (max-width: 767px)  { .desktop-only { display: none !important; } }
        @media (min-width: 768px)  { .mobile-only  { display: none !important; } }
      `}</style>

      {/* ── Main nav bar ── */}
      <nav
        style={{
          position: "fixed",
          top: 32,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 68,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          background: scrolled ? "rgba(10,10,8,0.97)" : "rgba(10,10,8,0.88)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: scrolled
            ? "1px solid rgba(240,235,225,0.08)"
            : "1px solid transparent",
          transition: "background 0.4s ease, border-color 0.4s ease",
        }}
      >
        {/* ── Logo ── */}
        <button
          onClick={() => navigate("/")}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 400,
            color: "#f0ebe1",
            background: "none",
            border: "none",
            cursor: "pointer",
            letterSpacing: "0.12em",
            flexShrink: 0,
            padding: 0,
          }}
        >
          ÉLVAR
        </button>

        {/* ── Centre nav links (desktop) ── */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 36, margin: "0 auto" }}
          className="desktop-only"
        >
          {/* Collections */}
          <button onClick={() => navigate("/")} className="ev-nav-link" style={navLinkStyle}>
            Collections
          </button>

          {/* Category dropdown */}
          <div ref={catRef} style={{ position: "relative" }}>
            <button
              onClick={() => setCatOpen((o) => !o)}
              className="ev-nav-link"
              style={{ ...navLinkStyle, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              Categories
              <ChevronDown open={catOpen} />
            </button>

            {catOpen && categories.length > 0 && (
              <div
                className="ev-cat-dropdown"
                style={{
                  position: "absolute",
                  top: "calc(100% + 20px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#111110",
                  border: "1px solid rgba(240,235,225,0.09)",
                  minWidth: 180,
                  boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
                  padding: "8px 0",
                }}
              >
                <div style={{ height: 1, background: "#c9a96e", margin: "0 0 8px", opacity: 0.5 }} />

                {["All Products", ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "10px 20px",
                      fontFamily: "'Didact Gothic', sans-serif",
                      fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase",
                      color: "rgba(240,235,225,0.42)",
                      background: "none", border: "none", cursor: "pointer",
                      transition: "color 0.2s, padding-left 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#c9a96e"; e.currentTarget.style.paddingLeft = "26px"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(240,235,225,0.42)"; e.currentTarget.style.paddingLeft = "20px"; }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── FIX: About Us — button with scroll handler instead of <Link> ── */}
          <button 
            onClick={handleAboutClick} 
            className="ev-nav-link" 
            style={{...navLinkStyle, visibility: "visible", opacity: 1}}
          >
            About Us
          </button>
        </div>

        {/* ── Right controls ── */}
        <div
          ref={searchWrapRef}
          style={{ display: "flex", alignItems: "center", gap: 24, marginLeft: "auto", position: "relative" }}
        >
          {/* ── FIX: Search icon always visible; dropdown floats below — no layout shift ── */}
          <button
            onClick={searchOpen ? closeSearch : openSearch}
            aria-label={searchOpen ? "Close search" : "Open search"}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: searchOpen ? "#c9a96e" : "rgba(240,235,225,0.42)",
              display: "flex", alignItems: "center",
              transition: "color 0.25s", padding: 0, position: "relative", zIndex: 2,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ebe1")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = searchOpen ? "#c9a96e" : "rgba(240,235,225,0.42)")
            }
          >
            {searchOpen ? <CloseIcon size={16} /> : <SearchIcon />}
          </button>

          {/* ── Search dropdown — absolutely positioned, no layout disruption ── */}
          {searchOpen && (
            <form
              onSubmit={handleSearchSubmit}
              className="ev-search-dropdown"
              style={{
                position: "absolute",
                top: "calc(100% + 18px)",
                right: 0,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(10,10,8,0.98)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(240,235,225,0.1)",
                borderRadius: 4,
                padding: "10px 14px",
                width: 280,
                boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
                zIndex: 50,
                visibility: "visible",
                opacity: 1,
              }}
            >
              <SearchIcon size={13} />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search pieces..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#f0ebe1",
                  fontFamily: "'Didact Gothic', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  minWidth: 0,
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={closeSearch}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(240,235,225,0.3)", display: "flex",
                    alignItems: "center", padding: 0, transition: "color 0.2s", flexShrink: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ebe1")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,225,0.3)")}
                >
                  <CloseIcon size={13} />
                </button>
              )}
            </form>
          )}

          {/* Cart icon + badge */}
          <button
            onClick={onCartClick}
            aria-label={`Cart (${cartCount} items)`}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(240,235,225,0.42)", display: "flex", alignItems: "center",
              position: "relative", transition: "color 0.25s", padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ebe1")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,225,0.42)")}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span
                className="ev-cart-badge"
                style={{
                  position: "absolute", top: -7, right: -8,
                  minWidth: 16, height: 16, borderRadius: "50%",
                  background: "#c9a96e", color: "#0a0a08",
                  fontFamily: "'Didact Gothic', sans-serif",
                  fontSize: 8, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  letterSpacing: 0, padding: "0 3px",
                }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="mobile-only"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(240,235,225,0.42)",
              display: "flex", flexDirection: "column", gap: 5, padding: 0, width: 22,
            }}
          >
            <span style={{
              display: "block", width: "100%", height: 1, background: "currentColor",
              transition: "transform 0.3s, opacity 0.3s",
              transform: mobileOpen ? "translateY(6px) rotate(45deg)" : "none",
            }} />
            <span style={{
              display: "block", width: "65%", height: 1, background: "currentColor",
              transition: "opacity 0.3s", opacity: mobileOpen ? 0 : 1,
            }} />
            <span style={{
              display: "block", width: "100%", height: 1, background: "currentColor",
              transition: "transform 0.3s, opacity 0.3s",
              transform: mobileOpen ? "translateY(-6px) rotate(-45deg)" : "none",
            }} />
          </button>
        </div>
      </nav>

      {/* ── Mobile full-screen overlay menu ── */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              zIndex: 98, animation: "ev-fade-in 0.3s ease both",
            }}
          />

          <div
            className="ev-mobile-menu"
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              width: "min(320px, 85vw)",
              background: "#0e0e0c",
              borderLeft: "1px solid rgba(240,235,225,0.08)",
              zIndex: 99, display: "flex", flexDirection: "column",
              padding: "80px 32px 40px", overflowY: "auto",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                position: "absolute", top: 22, right: 24,
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(240,235,225,0.35)",
              }}
            >
              <CloseIcon size={20} />
            </button>

            {/* Brand mark */}
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase",
              color: "#c9a96e", marginBottom: 40,
            }}>
              ÉLVAR
            </p>

            {/* Mobile search */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                borderBottom: "1px solid rgba(240,235,225,0.12)",
                paddingBottom: 12, marginBottom: 36,
              }}
            >
              <SearchIcon size={13} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search..."
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#f0ebe1", fontFamily: "'Didact Gothic', sans-serif",
                  fontSize: 12, letterSpacing: "0.18em", minWidth: 0,
                }}
              />
              {searchQuery && (
                <button
                  type="submit"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#c9a96e", fontSize: 9, fontFamily: "'Didact Gothic', sans-serif",
                    letterSpacing: "0.3em", textTransform: "uppercase",
                    transition: "color 0.2s", padding: "4px 8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ebe1")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#c9a96e")}
                >
                  Go
                </button>
              )}
            </form>

            {/* Collections link */}
            <button
              onClick={() => { navigate("/"); setMobileOpen(false); }}
              className="ev-nav-link"
              style={{
                width: "100%", textAlign: "left",
                fontFamily: "'Didact Gothic', sans-serif",
                fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
                color: "rgba(240,235,225,0.45)",
                background: "none", border: "none",
                padding: "14px 0", borderBottom: "1px solid rgba(240,235,225,0.06)",
                cursor: "pointer", transition: "color 0.25s", display: "block",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ebe1")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
            >
              Collections
            </button>

            {/* ── FIX: About Us mobile — same scroll handler ── */}
            <button
              onClick={handleAboutClick}
              className="ev-nav-link"
              style={{
                width: "100%", textAlign: "left",
                fontFamily: "'Didact Gothic', sans-serif",
                fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
                color: "rgba(240,235,225,0.45)",
                background: "none", border: "none",
                padding: "14px 0", borderBottom: "1px solid rgba(240,235,225,0.06)",
                cursor: "pointer", transition: "color 0.25s", display: "block",
                visibility: "visible", opacity: 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ebe1")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
            >
              About Us
            </button>

            {/* Mobile categories */}
            {categories.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p style={{
                  fontFamily: "'Didact Gothic', sans-serif",
                  fontSize: 7, letterSpacing: "0.55em", textTransform: "uppercase",
                  color: "#c9a96e", marginBottom: 16,
                }}>
                  Categories
                </p>
                {["All Products", ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "11px 0",
                      fontFamily: "'Didact Gothic', sans-serif",
                      fontSize: 9, letterSpacing: "0.38em", textTransform: "uppercase",
                      color: "rgba(240,235,225,0.3)",
                      background: "none", border: "none",
                      borderBottom: "1px solid rgba(240,235,225,0.05)",
                      cursor: "pointer", transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(240,235,225,0.7)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,225,0.3)")}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom brand text */}
            <div style={{ marginTop: "auto", paddingTop: 40 }}>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic", fontSize: 12,
                color: "rgba(240,235,225,0.15)", lineHeight: 1.6,
              }}>
                Crafted without<br />compromise.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NavBar;