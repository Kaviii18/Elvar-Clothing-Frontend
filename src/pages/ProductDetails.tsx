import { useState, useEffect, FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ProductPrice } from '../components/ProductPrice';
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
  original_price?: number;
  current_price?: number;
  is_discount_active?: boolean;
  discount_percentage?: number;
  category?: string;
  image_url?: string | null;
  image?: string | null;
  stock?: StockItem[] | null;
  sizes?: StockItem[] | null;
  size_chart_url?: string | null;
}

const getImageSrc = (product: Product | null) => {
  if (!product) return FALLBACK_IMG;
  const raw = product.image_url ?? product.image ?? '';
  return getImageUrl(raw) || FALLBACK_IMG;
};

const ProductDetails: FC<{ idParam?: string }> = ({ idParam }) => {
  const params = useParams<{ id: string }>();
  const productId = idParam ?? params.id;
  const navigate = useNavigate();
  const cart = useCart() as { addToCart?: (item: any) => void } | null;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showSizeGuide ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showSizeGuide]);

  useEffect(() => {
    if (!productId) return;
    let mounted = true;

    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(apiUrl(`/api/products/${encodeURIComponent(String(productId))}`));
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (mounted) setProduct(data.product ?? data);
      } catch (err) {
        if (mounted) setError('Unable to load product details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      mounted = false;
    };
  }, [productId]);

  const totalStock = (product?.stock ?? product?.sizes ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0);

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.stock && product.stock.length > 0 && !selectedSize) {
      return setError('Please select a size to continue.');
    }

    setAdding(true);
    try {
      if (cart?.addToCart) {
        cart.addToCart({
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: 1,
          size: selectedSize,
          image_url: getImageUrl(product.image_url ?? product.image) ?? null,
        });
      }
      navigate('/cart');
    } catch {
      setError('Could not add this piece to your cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A08] text-[#F0EBE1] flex items-center justify-center px-6 py-24">
        <span className="text-sm tracking-[0.45em] uppercase text-[#d9d3c3]">Loading product…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A08] text-[#F0EBE1] flex items-center justify-center px-6 py-24">
        <div className="max-w-xl text-center">
          <p className="text-sm uppercase tracking-[0.5em] text-[#c9a96e] mb-5">Oops</p>
          <p className="text-base leading-8 text-[#d9d3c3]">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A08] text-[#F0EBE1] flex items-center justify-center px-6 py-24">
        <p className="text-sm text-[#d9d3c3]">Product not found.</p>
      </div>
    );
  }

  const imageSrc = imgError ? FALLBACK_IMG : getImageSrc(product);
  const getSizeChartSrc = (p: Product | null) => {
    if (!p) return null;
    return getImageUrl(p.size_chart_url);
  };
  const sizeChartSrc = getSizeChartSrc(product) || null;
  const availableSizes = product.stock ?? product.sizes ?? [];
  const selectedStockItem = availableSizes.find((item) => item.size === selectedSize);
  const selectedStock = selectedStockItem?.quantity ?? null;
  const isSizeOutOfStock = selectedStock === 0;
  const isAddDisabled =
    adding ||
    totalStock === 0 ||
    isSizeOutOfStock ||
    (availableSizes.length > 0 && !selectedSize);

  return (
    <main className="min-h-screen bg-[#0A0A08] text-[#F0EBE1] pt-28 pb-24 px-6">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto">
        <div className="rounded-[32px] border border-white/5 bg-[#10100f] shadow-[0_40px_120px_rgba(0,0,0,0.35)] overflow-hidden">
          <div className="relative overflow-hidden">
            <img
              src={imageSrc}
              alt={product.title}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-[72vh] min-h-[420px] object-cover transition duration-1000 ease-out hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A08]/90 via-transparent to-transparent" />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.55em] text-[#c9a96e]">{product.category ?? 'Collection'}</p>
              <h1 className="font-[Playfair_Display] text-4xl md:text-5xl leading-[0.92] tracking-[-0.03em] text-[#F0EBE1]">
                {product.title}
              </h1>
            </div>

            <div className="space-y-6">
              <div className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-[#F0EBE1]">
                <ProductPrice product={product} className="text-[var(--bone)]" />
              </div>
              <p className="max-w-xl text-sm md:text-base leading-8 text-[#d9d3c3]">
                {product.description ?? 'A refined wardrobe essential for the modern collector, carefully crafted with deliberate lines and premium materials.'}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {availableSizes.length > 0 && (
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-[0.5em] text-[#c9a96e]">Size</div>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((stockItem) => {
                    const isSelected = selectedSize === stockItem.size;
                    const isOut = stockItem.quantity === 0;
                    return (
                      <button
                        key={stockItem.size}
                        type="button"
                        onClick={() => !isOut && setSelectedSize(stockItem.size)}
                        disabled={isOut}
                        className={`inline-flex items-center justify-center rounded-full border px-5 py-2 text-sm uppercase tracking-[0.35em] transition duration-300 ${isSelected ? 'bg-[#F0EBE1] text-[#0A0A08] border-[#F0EBE1]' : isOut ? 'border-white/10 bg-white/5 text-[#7a7a75] line-through opacity-60 cursor-not-allowed' : 'border-white/10 text-[#d9d3c3] hover:border-[#c9a96e] hover:text-[#F0EBE1]'}`}
                      >
                        {stockItem.size}
                      </button>
                    );
                  })}
                </div>

                {/* Size Guide link */}
                {sizeChartSrc && (
                  <div className="mt-3">
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Size Guide 📐
                    </button>
                  </div>
                )}

                <div className="text-sm leading-7">
                  {selectedSize ? (
                    <p className={`mt-3 ${isSizeOutOfStock ? 'text-[#c0840f]' : selectedStock !== null && selectedStock <= 5 ? 'text-[#c9a96e]' : 'text-[#d9d3c3]'}`}>
                      {isSizeOutOfStock
                        ? 'Out of stock for this size.'
                        : selectedStock !== null
                          ? selectedStock <= 5
                            ? `Only ${selectedStock} ${selectedStock === 1 ? 'piece' : 'pieces'} left.`
                            : 'In stock and ready to ship.'
                          : 'Available.'}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-[#6f6f6a]">Select a size to view stock availability.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddDisabled}
                className="w-full sm:w-auto rounded-full bg-[#F0EBE1] px-10 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#0A0A08] shadow-[0_22px_55px_rgba(240,235,225,0.24)] transition duration-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSizeOutOfStock ? 'Out of Stock' : adding ? 'Adding…' : 'Add to Cart'}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-6 py-3 text-sm uppercase tracking-[0.35em] text-[#d9d3c3] transition duration-300 hover:border-[#c9a96e] hover:text-[#F0EBE1]"
              >
                <span className="text-xl leading-none">←</span>
                Back
              </button>
            </div>

            {totalStock === 0 && (
              <p className="text-sm text-[#d9d3c3]">This piece is currently sold out. Please check back soon for restock updates.</p>
            )}
          </div>
        </div>
      </section>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 backdrop-blur-sm bg-black/70"
            onClick={() => setShowSizeGuide(false)}
          />

          <div className="relative z-10 w-full max-w-3xl mx-4 sm:mx-6">
            <button
              onClick={() => setShowSizeGuide(false)}
              aria-label="Close size guide"
              className="absolute -top-3 -right-3 z-20 bg-[#0A0A08] text-slate-300 rounded-full w-9 h-9 flex items-center justify-center shadow"
            >
              ×
            </button>

            <div className="rounded-md overflow-hidden bg-[#0A0A08] p-4">
              <img
                src={sizeChartSrc || '/images/default-size-chart.png'}
                alt="Size guide"
                className="w-full h-auto object-contain rounded"
                style={{ maxHeight: '70vh' }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductDetails;
