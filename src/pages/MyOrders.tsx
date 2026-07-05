import { useEffect, useState, ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatLKR } from '../contexts/CartContext';
import { apiUrl } from '../config/api';

interface OrderItem {
  product_id: number;
  title:      string;
  size:       string;
  quantity:   number;
  unit_price: number;
}

interface Order {
  id:                number;
  items_json:        OrderItem[];
  total_price:       string;
  shipping_fee:      string;
  payment_method:    string;
  delivery_district: string | null;
  status:            string;
  created_at:        string;
}

interface MyOrdersProps {
  onBack: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  Pending:    'text-yellow-400 bg-yellow-900/20 border-yellow-800/40',
  Processing: 'text-blue-400 bg-blue-900/20 border-blue-800/40',
  Shipped:    'text-purple-400 bg-purple-900/20 border-purple-800/40',
  Delivered:  'text-green-400 bg-green-900/20 border-green-800/40',
  Cancelled:  'text-red-400 bg-red-900/20 border-red-800/40',
};

const MyOrders = ({ onBack }: MyOrdersProps): ReactElement => {
  const { token } = useAuth();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error,   setError]   = useState<string>('');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(apiUrl('/api/orders/my-orders'), {
      headers: { 'Authorization': 'Bearer ' + token },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setOrders(data.orders);
        else setError(data.message);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load orders.');
        setLoading(false);
      });
  }, [token]);

  const fmt = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <button onClick={onBack} className="flex items-center gap-2 text-elvar-muted text-xs font-body tracking-widest uppercase mb-6 hover:text-elvar-cream transition-colors">
          <span>&#8592;</span> Back
        </button>
        <p className="text-xs tracking-widest3 uppercase text-elvar-muted font-body mb-2">Account</p>
        <h2 className="font-display text-5xl font-light text-elvar-cream">My Orders</h2>
        <div className="gold-line mt-4" />
      </div>

      {loading && (
        <div className="text-center py-20">
          <p className="text-elvar-muted font-body text-xs tracking-widest uppercase animate-pulse">
            Loading orders&hellip;
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="text-red-400 font-body text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-20">
          <p className="font-display text-4xl text-elvar-muted font-light italic">No orders yet.</p>
          <p className="font-body text-xs text-elvar-muted mt-3">
            Your order history will appear here once you place your first order.
          </p>
          <button onClick={onBack} className="elvar-btn mt-8">Start Shopping</button>
        </div>
      )}

      <div className="space-y-6">
        {orders.map(order => {
          const items: OrderItem[] = Array.isArray(order.items_json)
            ? order.items_json
            : (typeof order.items_json === 'string' ? JSON.parse(order.items_json) : []);

          return (
            <div key={order.id} className="elvar-card p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-elvar-border">
                <div>
                  <p className="font-body text-xs tracking-widest uppercase text-elvar-muted mb-1">
                    Order #{order.id}
                  </p>
                  <p className="font-body text-xs text-elvar-muted">{fmt(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={'px-3 py-1 text-xs font-body tracking-widest uppercase border ' + (STATUS_COLORS[order.status] || 'text-elvar-muted bg-elvar-surface border-elvar-border')}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-5">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm font-body">
                    <span className="text-elvar-cream">
                      {item.title}
                      <span className="text-elvar-muted ml-2">({item.size} &times; {item.quantity})</span>
                    </span>
                    <span className="text-elvar-muted">{formatLKR(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-elvar-border pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs font-body text-elvar-muted">
                  <span className="mr-4">{order.payment_method}</span>
                  {order.delivery_district && <span>{order.delivery_district}</span>}
                </div>
                <div className="text-right">
                  <p className="text-xs font-body text-elvar-muted">
                    Shipping: {formatLKR(Number(order.shipping_fee))}
                  </p>
                  <p className="font-display text-lg text-elvar-gold">
                    {formatLKR(Number(order.total_price))}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
