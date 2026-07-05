import { ReactElement } from 'react';
import { useCart, formatLKR } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CartPageProps {
  onCheckout:   () => void;
  onContinue:   () => void;
  onLogin:      () => void;
}

const CartPage = ({ onCheckout, onContinue, onLogin }: CartPageProps): ReactElement => {
  const { items, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <p className="font-display text-6xl text-elvar-border font-light mb-6">&#9675;</p>
        <h2 className="font-display text-4xl font-light text-elvar-muted italic">Your cart is empty.</h2>
        <div className="gold-line mx-auto mt-6 mb-8" />
        <button onClick={onContinue} className="elvar-btn px-12">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-widest3 uppercase text-elvar-muted font-body mb-2">
          {totalItems} {totalItems === 1 ? 'piece' : 'pieces'} selected
        </p>
        <h2 className="font-display text-5xl font-light text-elvar-cream">Your Cart</h2>
        <div className="gold-line mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Item list */}
        <div className="lg:col-span-2 space-y-0 divide-y divide-elvar-border">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-5 py-6">
              {/* Image */}
              <div className="w-24 h-32 flex-shrink-0 bg-elvar-surface overflow-hidden">
                {item.image_url
                  ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-elvar-accent/20 to-elvar-card" />}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl font-light text-elvar-cream leading-tight">{item.title}</h3>
                  <p className="font-body text-xs text-elvar-muted mt-1 tracking-widest uppercase">
                    Size: {item.size}
                  </p>
                  <p className="font-display text-base text-elvar-gold mt-2">{formatLKR(item.price)}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-0 border border-elvar-border">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                      className="w-8 h-8 text-elvar-muted hover:text-elvar-cream hover:bg-elvar-surface transition-colors font-body text-lg leading-none"
                    >
                      &minus;
                    </button>
                    <span className="w-10 text-center text-sm font-body text-elvar-cream">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                      className="w-8 h-8 text-elvar-muted hover:text-elvar-cream hover:bg-elvar-surface transition-colors font-body text-lg leading-none"
                    >
                      &#43;
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-display text-base text-elvar-cream">
                      {formatLKR(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product_id, item.size)}
                      className="text-elvar-muted hover:text-red-400 transition-colors font-body text-xs tracking-widest uppercase"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="elvar-card p-6 sticky top-24">
            <p className="elvar-label mb-6">Order Summary</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm font-body">
                <span className="text-elvar-muted">Subtotal ({totalItems} items)</span>
                <span className="text-elvar-cream">{formatLKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-elvar-muted">Estimated Shipping</span>
                <span className="text-elvar-muted text-xs italic">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-elvar-border pt-4 mb-6 flex justify-between">
              <span className="font-display text-lg text-elvar-cream">Total</span>
              <span className="font-display text-xl text-elvar-gold">{formatLKR(subtotal)}</span>
            </div>

            {user ? (
              <button onClick={onCheckout} className="elvar-btn w-full">
                Proceed to Checkout
              </button>
            ) : (
              <div>
                <button onClick={onLogin} className="elvar-btn w-full">
                  Sign In to Checkout
                </button>
                <p className="text-center text-xs text-elvar-muted font-body mt-3">
                  You must be logged in to place an order.
                </p>
              </div>
            )}

            <button onClick={onContinue} className="elvar-btn-ghost w-full mt-3">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
