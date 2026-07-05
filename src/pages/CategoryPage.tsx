import { useEffect, useState, FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiUrl, getImageUrl } from '../config/api';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop';

interface StockItem {
  size: string;
  quantity: number;
}

interface Product {
  id: number | string;
  title: string;
  description?: string | null;
  price: number;
  category?: string;
  image_url?: string | null;
  image?: string | null;
  stock?: StockItem[] | null;
}

const formatPrice = (value: number) =>
  'LKR ' + value.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const cap = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const getImageSrc = (product: Product) => {
  const raw = product.image_url ?? product.image ?? '';
  return getImageUrl(raw) || FALLBACK_IMG;
};

const toCategoryLabel = (slug: string) => {
  if (!slug) return 'All Collection';
  const decoded = decodeURIComponent(slug).replace(/-/g, ' ').trim();
  if (decoded.toLowerCase() === 'all') return 'All Collection';
  return `${cap(decoded)} Collection`;
};

const CategoryPage: FC<{ categorySlug?: string }> = ({ categorySlug: categorySlugProp }) => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizedSlug = categorySlugProp ?? categoryName ?? 'all';
  const categorySlug = normalizedSlug ? decodeURIComponent(normalizedSlug).replace(/-/g, ' ') : 'all';
  const heading = toCategoryLabel(normalizedSlug);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const query = categorySlug.toLowerCase() === 'all'
          ? ''
          : `?category=${encodeURIComponent(categorySlug)}`;
        const res = await fetch(apiUrl(`/api/products${query}`));
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setProducts(data.products ?? data);
      } catch (err) {
        if (!mounted) return;
        setError('Unable to load products for this collection.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [categorySlug]);

  return (
    <main className="min-h-screen bg-[#0A0A08] text-[#F0EBE1] pt-28 pb-24 px-4 lg:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.55em] text-[#c9a96e]">Collection</p>
            <h1 className="font-[Playfair_Display] text-4xl md:text-5xl tracking-[-0.03em] text-[#F0EBE1]">
              {heading}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#d9d3c3]">
              Discover every piece curated for this category, presented in a calm editorial grid with elegant spacing and premium detail.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-6 py-3 text-sm uppercase tracking-[0.35em] text-[#d9d3c3] transition duration-300 hover:border-[#c9a96e] hover:text-[#c9a96e]"
          >
            <span className="text-xl leading-none">←</span>
            Home
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-4 rounded-[28px] border border-white/5 bg-[#111110] p-6">
                <div className="h-[320px] rounded-[24px] bg-[#191919] animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-[#1f1f1f] animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-[#1f1f1f] animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[24px] border border-white/10 bg-[#111110] p-12 text-center">
            <p className="text-sm text-[#d9d3c3]">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => navigate(`/product/${product.id}`)}
                className="group overflow-hidden rounded-[28px] border border-white/5 bg-[#10100f] text-left transition duration-300 hover:-translate-y-1 hover:border-[#c9a96e]/30"
              >
                <div className="relative h-[340px] overflow-hidden bg-[#111110]">
                  <img
                    src={getImageSrc(product)}
                    alt={product.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-[1.02]"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-[#c9a96e]">{product.category ?? 'Collection'}</p>
                  <h2 className="text-lg font-[Playfair_Display] leading-tight text-[#F0EBE1]">{product.title}</h2>
                  <p className="text-sm uppercase tracking-[0.35em] text-[#d9d3c3]">{formatPrice(product.price)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default CategoryPage;
