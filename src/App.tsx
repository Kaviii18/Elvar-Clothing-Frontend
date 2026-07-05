import { useEffect, useState, FormEvent, ReactElement } from 'react';
import { createPortal } from 'react-dom';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import AnnouncementBar from './components/AnnouncementBar';
import CheckoutForm from './components/CheckoutForm';
import Footer from './components/Footer';
import Home from './pages/Home';
import CustomerLogin from './pages/CustomerLogin';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CartPage from './pages/CartPage';
import MyOrders from './pages/MyOrders';
import ProductDetails from './pages/ProductDetails';
import CategoryPage from './pages/CategoryPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import WhatsAppButton from './components/WhatsAppButton'; // WhatsApp Button Import එක

const AppRoutes = (): ReactElement => {
  const { user, isAdmin, logout } = useAuth();
  const { totalItems, clearCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const hideChrome = location.pathname.startsWith('/elvar-portal') || location.pathname.startsWith('/admin');

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Lock background scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleLogoClick = (): void => {
    navigate('/');
  };

  const handleAboutClick = (): void => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 250);
      return;
    }
    document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearSearch = (): void => {
    setSearchTerm('');
    if (location.pathname === '/' && location.search.includes('search=')) {
      navigate('/');
    }
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  const NavBar = (): ReactElement => (
    <header className="fixed top-[32px] left-0 right-0 z-40 bg-elvar-bg/95 backdrop-blur-sm border-b border-elvar-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        <button
          onClick={handleLogoClick}
          className="font-display text-xl md:text-2xl font-light tracking-widest text-elvar-cream select-none cursor-pointer hover:text-elvar-gold transition-colors duration-300"
        >
          Élvar Clothing
        </button>

        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className={'font-body text-xs tracking-widest uppercase transition-colors ' +
              (location.pathname === '/' ? 'text-elvar-gold' : 'text-elvar-muted hover:text-elvar-cream')}
          >
            Collection
          </button>

          <button
            onClick={handleAboutClick}
            className="font-body text-xs tracking-widest uppercase text-elvar-muted hover:text-elvar-cream transition-colors"
          >
            About Us
          </button>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center gap-2 rounded-full border border-elvar-border bg-elvar-cream/[0.04] px-3 py-2 transition-all duration-300 focus-within:w-72 focus-within:border-elvar-gold/60 focus-within:bg-elvar-cream/[0.07] w-56"
          >
            <svg className="h-3.5 w-3.5 shrink-0 text-elvar-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="m21 21-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
            </svg>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent border-none outline-none font-body text-[0.65rem] tracking-[0.18em] text-elvar-cream placeholder:text-elvar-muted/60"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="text-elvar-muted hover:text-elvar-cream transition-colors"
              >
                ×
              </button>
            )}

            <button
              type="submit"
              aria-label="Submit search"
              className="font-body text-[0.55rem] tracking-[0.28em] uppercase text-elvar-gold hover:text-elvar-cream transition-colors"
            >
              Go
            </button>
          </form>

          {user && (
            <button
              onClick={() => navigate('/my-orders')}
              className={'font-body text-xs tracking-widest uppercase transition-colors ' +
                (location.pathname === '/my-orders' ? 'text-elvar-gold' : 'text-elvar-muted hover:text-elvar-cream')}
            >
              My Orders
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="font-body text-xs tracking-widest uppercase text-elvar-gold hover:text-elvar-gold-light transition-colors"
            >
              Admin
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-elvar-muted font-body text-xs hidden lg:block">{user.name}</span>
              <button
                onClick={() => { logout(); clearCart(); navigate('/'); }}
                className="font-body text-xs tracking-widest uppercase text-elvar-muted hover:text-elvar-cream transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/customer-login')}
              className="font-body text-xs tracking-widest uppercase text-elvar-muted hover:text-elvar-cream transition-colors"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => navigate('/cart')}
            className={'relative font-body text-xs tracking-widest uppercase transition-colors ' +
              (location.pathname === '/cart' ? 'text-elvar-gold' : 'text-elvar-muted hover:text-elvar-cream')}
          >
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 w-4 h-4 rounded-full bg-elvar-gold text-elvar-bg text-[9px] font-bold flex items-center justify-center leading-none">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
        </nav>

        <div className="flex md:hidden items-center gap-5">
          <button onClick={() => navigate('/cart')} className="relative text-elvar-muted" aria-label="Cart">
            <span className="sr-only">Cart</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-elvar-gold text-elvar-bg text-[9px] font-bold flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>

          {/* Hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex flex-col justify-center gap-[5px] w-6 h-6 text-elvar-muted"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`block h-px w-full bg-current transition-transform duration-300 ${mobileMenuOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`block h-px w-full bg-current transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`block h-px w-full bg-current transition-transform duration-300 ${mobileMenuOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );

  // ── Mobile drawer + overlay ──────────────────────────────────────────────
  // IMPORTANT: rendered via a PORTAL straight into <body>, NOT nested inside
  // <header>. The header uses `backdrop-blur-sm`, and any CSS `filter` /
  // `backdrop-filter` / `transform` on an ancestor turns that ancestor into
  // the containing block for `position: fixed` descendants (per spec). That
  // silently clipped this drawer to the header's own 64px-tall box instead
  // of the viewport — which is why it rendered as a blank/cut-off dark strip.
  // Portaling to document.body sidesteps that containing-block issue
  // entirely, regardless of what filter effects exist anywhere in the tree.
  const MobileMenu = (): ReactElement | null => {
    if (!mobileMenuOpen) return null;

    return createPortal(
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-[100] bg-black/50 md:hidden animate-[ev-fade-in_0.25s_ease_both]"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-y-0 right-0 z-[101] w-[min(320px,85vw)] max-w-full h-screen
                     bg-elvar-bg border-l border-elvar-border
                     flex flex-col p-6 overflow-y-auto md:hidden
                     animate-[ev-slide-in_0.3s_cubic-bezier(0.22,1,0.36,1)_both]"
        >
          <div className="flex items-center justify-between mb-8 flex-shrink-0">
            <span className="font-display text-lg text-elvar-cream tracking-widest">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="text-elvar-muted hover:text-elvar-cream transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Search */}
          <form
            onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 rounded-full border border-elvar-border bg-elvar-cream/[0.04] px-3 py-2.5 mb-8 flex-shrink-0"
          >
            <svg className="h-3.5 w-3.5 shrink-0 text-elvar-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="m21 21-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent border-none outline-none font-body text-xs tracking-[0.1em] text-elvar-cream placeholder:text-elvar-muted/60"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="font-body text-[0.6rem] tracking-[0.28em] uppercase text-elvar-gold hover:text-elvar-cream transition-colors flex-shrink-0"
            >
              Go
            </button>
          </form>

          {/* Links */}
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => navigate('/')}
              className={'text-left font-body text-xs tracking-widest uppercase py-3 border-b border-elvar-border transition-colors ' +
                (location.pathname === '/' ? 'text-elvar-gold' : 'text-elvar-muted hover:text-elvar-cream')}
            >
              Collection
            </button>

            <button
              onClick={() => { handleAboutClick(); setMobileMenuOpen(false); }}
              className="text-left font-body text-xs tracking-widest uppercase py-3 border-b border-elvar-border text-elvar-muted hover:text-elvar-cream transition-colors"
            >
              About Us
            </button>

            {user && (
              <button
                onClick={() => navigate('/my-orders')}
                className={'text-left font-body text-xs tracking-widest uppercase py-3 border-b border-elvar-border transition-colors ' +
                  (location.pathname === '/my-orders' ? 'text-elvar-gold' : 'text-elvar-muted hover:text-elvar-cream')}
              >
                My Orders
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-left font-body text-xs tracking-widest uppercase py-3 border-b border-elvar-border text-elvar-gold hover:text-elvar-gold-light transition-colors"
              >
                Admin
              </button>
            )}

            <button
              onClick={() => navigate('/cart')}
              className={'text-left font-body text-xs tracking-widest uppercase py-3 border-b border-elvar-border transition-colors ' +
                (location.pathname === '/cart' ? 'text-elvar-gold' : 'text-elvar-muted hover:text-elvar-cream')}
            >
              Cart {totalItems > 0 ? `(${totalItems})` : ''}
            </button>

            {user ? (
              <button
                onClick={() => { logout(); clearCart(); navigate('/'); }}
                className="text-left font-body text-xs tracking-widest uppercase py-3 border-b border-elvar-border text-elvar-muted hover:text-elvar-cream transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => navigate('/customer-login')}
                className="text-left font-body text-xs tracking-widest uppercase py-3 border-b border-elvar-border text-elvar-muted hover:text-elvar-cream transition-colors"
              >
                Sign In
              </button>
            )}

            {user && (
              <p className="font-body text-xs text-elvar-muted mt-4">{user.name}</p>
            )}
          </nav>
        </div>
      </>,
      document.body
    );
  };

  const Layout = ({ children }: { children: ReactElement }) => (
    <div>
      {!hideChrome && <AnnouncementBar />}
      {!hideChrome && <NavBar />}
      {!hideChrome && <MobileMenu />}
      {!hideChrome && <div style={{ height: 100 }} />}
      
      {children}
      
      {/* WhatsApp Button එක මෙතන තියෙන නිසා හැම පිටුවකම පේනවා */}
      {!hideChrome && <WhatsAppButton />}
      
      {!hideChrome && <Footer />}
    </div>
  );

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home {...({ onGoToCart: () => navigate('/cart') } as any)} />} />
        <Route path="/collection/:category" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage onCheckout={() => navigate('/checkout')} onContinue={() => navigate('/')} onLogin={() => navigate('/customer-login')} />} />
        <Route path="/checkout" element={<CheckoutForm onSuccess={() => navigate('/')} onCancel={() => navigate('/cart')} />} />
        <Route path="/customer-login" element={<CustomerLogin onSuccess={() => navigate('/')} onBack={() => navigate('/')} />} />
        <Route path="/my-orders" element={<MyOrders onBack={() => navigate('/')} />} />
        <Route path="/elvar-portal" element={<AdminLogin />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard onLogout={() => { logout(); clearCart(); navigate('/'); }} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App = (): ReactElement => (
  <AuthProvider>
    <CartProvider>
      <Router>
        <AppRoutes />
      </Router>
    </CartProvider>
  </AuthProvider>
);

export default App;