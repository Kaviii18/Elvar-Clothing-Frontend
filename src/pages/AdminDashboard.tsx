import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatLKR } from '../contexts/CartContext';
import OrderInvoice from '../components/OrderInvoice';
import SalesChart from '../components/SalesChart';
import type { SalesDataPoint } from '../components/SalesChart';
import { apiUrl } from '../config/api';

interface DashStats {
  total_orders: number;
  pending_orders: number;
  total_revenue: string;
  total_products: number;
  total_customers: number;
}

interface StockEntry {
  size: string;
  quantity: number;
}

interface Product {
  id: number;
  title: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_active: number;
  stock: StockEntry[] | null;
}

interface OrderItem {
  product_id: number;
  title: string;
  size: string;
  quantity: number;
  unit_price: number;
}

interface AdminOrder {
  id: number;
  customer_name: string;
  customer_email: string;
  items_json: OrderItem[] | string;
  total_price: string;
  shipping_fee: string;
  payment_method: string;
  delivery_district: string | null;
  status: string;
  created_at: string;
}

type AdminTab = 'overview' | 'orders' | 'products' | 'add_product' | 'reports';

const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface AdminDashboardProps {
  onLogout: () => void;
}

// ─── Helper: aggregate report rows → chart-ready SalesDataPoint[] ─────────
// Groups by calendar day: "01 Jun", "02 Jun", …
// You can swap "day" for "month" by changing the toLocaleDateString options.
const parseOrderItems = (itemsJson: AdminOrder['items_json']): OrderItem[] => {
  if (Array.isArray(itemsJson)) return itemsJson;

  if (typeof itemsJson !== 'string') return [];

  try {
    const parsed = JSON.parse(itemsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[parseOrderItems] Invalid order items JSON:', err);
    return [];
  }
};

const aggregateToChartData = (
  salesData: {
    order_id: number;
    created_at: string;
    total_price: string;
    status: string;
  }[]
): SalesDataPoint[] => {
  const map = new Map<string, { name: string; sales: number; orders: number; sortTime: number }>();

  salesData.forEach((row) => {
    if (row.status === 'Cancelled') return;

    const date = new Date(row.created_at);
    if (Number.isNaN(date.getTime())) return;

    const key = date.toISOString().slice(0, 10);
    const name = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
    const sortTime = new Date(key).getTime();
    const existing = map.get(key) ?? { name, sales: 0, orders: 0, sortTime };

    map.set(key, {
      ...existing,
      sales: existing.sales + Number(row.total_price || 0),
      orders: existing.orders + 1,
    });
  });

  return Array.from(map.values())
    .sort((left, right) => left.sortTime - right.sortTime)
    .map(({ name, sales, orders }) => ({ name, sales, orders }));
};

const AdminDashboard = ({ onLogout }: AdminDashboardProps): ReactElement => {
  const { token, user } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');

  const [stats, setStats] = useState<DashStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<AdminOrder | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [editError, setEditError] = useState<string>('');
  const [editSuccess, setEditSuccess] = useState<string>('');

  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [newCategoryId, setNewCategoryId] = useState<number | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');
  const [categorySuccess, setCategorySuccess] = useState<string>('');
  const [categorySaving, setCategorySaving] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);
  const [newStock, setNewStock] = useState<{ size: string; quantity: string }[]>(
    SIZES.map((s) => ({ size: s, quantity: '0' }))
  );
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [addError, setAddError] = useState<string>('');
  const [addSuccess, setAddSuccess] = useState<string>('');

  const [stockProductId, setStockProductId] = useState<string>('');
  const [stockSize, setStockSize] = useState<string>('M');
  const [stockQty, setStockQty] = useState<string>('');
  const [stockMsg, setStockMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Report / Analytics state
  const [reportStartDate, setReportStartDate] = useState<string>('');
  const [reportEndDate, setReportEndDate] = useState<string>('');
  const [reportData, setReportData] = useState<{
    totalRevenue: string;
    totalOrders: number;
    salesData: Array<{
      order_id: number;
      created_at: string;
      customer_name: string;
      total_price: string;
      payment_method: string;
      status: string;
    }>;
  } | null>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  // ─── Derive chart data whenever reportData changes ──────────────────────
  const chartData: SalesDataPoint[] = useMemo(
    () => (reportData ? aggregateToChartData(reportData.salesData) : []),
    [reportData]
  );

  // ─── Overview sparkline: last 7 days from live orders (client-side) ─────
  const overviewChartData: SalesDataPoint[] = useMemo(() => {
    if (!orders.length) return [];
    const map = new Map<string, { sales: number; orders: number }>();
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

    orders.forEach((o) => {
      const createdAt = new Date(o.created_at);
      if (Number.isNaN(createdAt.getTime()) || createdAt.getTime() < cutoff) return;
      if (o.status === 'Cancelled') return;
      const label = createdAt.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      });
      const e = map.get(label) ?? { sales: 0, orders: 0 };
      map.set(label, { sales: e.sales + Number(o.total_price || 0), orders: e.orders + 1 });
    });

    return Array.from(map.entries()).map(([name, vals]) => ({ name, ...vals }));
  }, [orders]);

  const authHeader = useCallback(
    (): Record<string, string> => ({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (token || ''),
    }),
    [token]
  );

  const authHeaderMultipart = useCallback(
    (): Record<string, string> => ({
      Authorization: 'Bearer ' + (token || ''),
    }),
    [token]
  );

  const fetchStats = useCallback(async (): Promise<void> => {
    setStatsLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/dashboard/stats`), {
        headers: authHeader(),
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } finally {
      setStatsLoading(false);
    }
  }, [authHeader]);

  const fetchOrders = useCallback(async (): Promise<void> => {
    setOrdersLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/orders`), {
        headers: authHeader(),
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } finally {
      setOrdersLoading(false);
    }
  }, [authHeader]);

  const fetchProducts = useCallback(async (): Promise<void> => {
    setProductsLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/products`), {
        headers: authHeader(),
      });
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } finally {
      setProductsLoading(false);
    }
  }, [authHeader]);

  const fetchCategories = useCallback(async (): Promise<void> => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/categories`));
      const data = await res.json();
      if (data.success) {
        const list: { id: number; name: string }[] = data.categories || [];
        setCategories(list);
        setNewCategoryId((current) => current ?? (list.length > 0 ? list[0].id : null));
      }
    } catch (err) {
      console.error('[fetchCategories] Error:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchSalesReport = useCallback(
    async (startDate?: string, endDate?: string): Promise<void> => {
      setReportLoading(true);
      try {
        let url = apiUrl(`/api/admin/reports/sales`);
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url, { headers: authHeader() });
        const data = await res.json();
        if (data.success) setReportData(data.report);
      } catch (err) {
        console.error('[fetchSalesReport] Error:', err);
      } finally {
        setReportLoading(false);
      }
    },
    [authHeader]
  );

  useEffect(() => {
    if (tab === 'overview') { fetchStats(); fetchOrders(); }
    if (tab === 'orders') fetchOrders();
    if (tab === 'products' || tab === 'add_product') fetchProducts();
    if (tab === 'reports') fetchSalesReport();
    fetchCategories();
  }, [tab, fetchStats, fetchOrders, fetchProducts, fetchSalesReport, fetchCategories]);

  const updateOrderStatus = async (orderId: number, status: string): Promise<void> => {
    setStatusUpdating(orderId);
    try {
      const res = await fetch(apiUrl(`/api/admin/orders/update-status`), {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ order_id: orderId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      } else {
        alert(data.message);
      }
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleAddProduct = async (): Promise<void> => {
    setAddError('');
    setAddSuccess('');
    if (!newTitle.trim() || !newPrice || !newCategoryId) {
      setAddError('Title, price and category are required.');
      return;
    }

    const stockPayload = newStock
      .filter((s) => parseInt(s.quantity, 10) > 0)
      .map((s) => ({ size: s.size, quantity: parseInt(s.quantity, 10) }));
    if (stockPayload.length === 0) {
      setAddError('Add at least one size with stock > 0.');
      return;
    }
    setAddLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newTitle.trim());
      formData.append('description', newDesc || '');
      formData.append('price', newPrice);
      formData.append('category_id', String(newCategoryId));
      if (imageFile) formData.append('image', imageFile);
      if (sizeChartFile) formData.append('sizeChart', sizeChartFile);
      formData.append('stock', JSON.stringify(stockPayload));
      const res = await fetch(apiUrl(`/api/admin/products/add`), {
        method: 'POST',
        headers: authHeaderMultipart(),
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAddSuccess('Product "' + newTitle + '" added successfully!');
        setNewTitle(''); setNewDesc(''); setNewPrice('');
        setNewCategoryId(categories.length > 0 ? categories[0].id : null);
        setImageFile(null); setSizeChartFile(null);
        setNewStock(SIZES.map((s) => ({ size: s, quantity: '0' })));
        fetchProducts();
      } else {
        setAddError(data.message);
      }
    } catch {
      setAddError('Network error.');
    }
    setAddLoading(false);
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editingProduct) return;
    setEditError(''); setEditSuccess('');

    try {
      const res = await fetch(apiUrl(`/api/admin/products/${editingProduct.id}`), {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setEditSuccess('Product updated.');
        fetchProducts();
        setTimeout(() => { setEditingProduct(null); setEditSuccess(''); }, 1200);
      } else {
        setEditError(data.message);
      }
    } catch {
      setEditError('Network error.');
    }
  };

  const handleStockUpdate = async (): Promise<void> => {
    setStockMsg(null);
    if (!stockProductId || !stockSize || !stockQty) {
      setStockMsg({ ok: false, text: 'All fields are required.' });
      return;
    }
    try {
      const res = await fetch(apiUrl(`/api/admin/products/stock/update`), {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({
          product_id: parseInt(stockProductId, 10),
          size: stockSize,
          quantity: parseInt(stockQty, 10),
        }),
      });
      const data = await res.json();
      setStockMsg({ ok: data.success, text: data.message });
      if (data.success) fetchProducts();
    } catch {
      setStockMsg({ ok: false, text: 'Network error.' });
    }
  };

  const handleDeleteProduct = async (productId: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/products/${productId}`), {
        method: 'DELETE',
        headers: authHeader(),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error('[handleDeleteProduct] Error:', err);
      alert('Network error while deleting product.');
    }
  };

  const handleApplyDateFilter = (): void => {
    fetchSalesReport(reportStartDate, reportEndDate);
  };

  const downloadCSV = (): void => {
    if (!reportData || reportData.salesData.length === 0) {
      alert('No sales data to export.');
      return;
    }

    const escapeCSV = (value: string | number): string => {
      const text = String(value ?? '');
      return /[\",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const headers = ['Order ID', 'Date', 'Customer Name', 'Total Price (LKR)', 'Payment Method', 'Status'];
    const rows = reportData.salesData.map((order) => [
      order.order_id,
      new Date(order.created_at).toLocaleDateString('en-GB'),
      order.customer_name,
      order.total_price,
      order.payment_method,
      order.status,
    ]);
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `elvar-sales-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const STATUS_COLORS: Record<string, string> = {
    Pending: 'text-yellow-400',
    Processing: 'text-blue-400',
    Shipped: 'text-purple-400',
    Delivered: 'text-green-400',
    Cancelled: 'text-red-400',
  };

  const fmt = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

  const TABS: { key: AdminTab; label: string }[] = [
    { key: 'overview',    label: 'Overview'      },
    { key: 'orders',      label: 'Orders'        },
    { key: 'products',    label: 'Products'      },
    { key: 'add_product', label: 'Add Product'   },
    { key: 'reports',     label: 'Sales Reports' },
  ];

  const invoiceItems = useMemo(
    () => (invoiceOrder ? parseOrderItems(invoiceOrder.items_json) : []),
    [invoiceOrder]
  );

  return (
    <div className="min-h-screen bg-elvar-bg">
      {/* ── Header ── */}
      <header className="bg-elvar-surface border-b border-elvar-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-elvar-gold font-display text-xl">&#9650;</span>
          <div>
            <p className="font-body text-xs tracking-widest uppercase text-elvar-muted">Administrator</p>
            <p className="font-display text-lg text-elvar-cream">&Eacute;lvar Clothing</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-elvar-muted font-body text-xs hidden sm:block">{user?.name}</p>
          <button onClick={onLogout} className="elvar-btn-ghost text-xs py-2 px-4">Sign Out</button>
        </div>
      </header>

      {/* ── Tab Bar ── */}
      <div className="bg-elvar-surface border-b border-elvar-border px-6">
        <div className="flex overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                'px-5 py-4 font-body text-xs tracking-widest uppercase whitespace-nowrap transition-colors border-b-2 ' +
                (tab === t.key
                  ? 'text-elvar-gold border-elvar-gold'
                  : 'text-elvar-muted border-transparent hover:text-elvar-cream')
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ════════════════ OVERVIEW ════════════════ */}
        {tab === 'overview' && (
          <div>
            <h2 className="font-display text-4xl font-light text-elvar-cream mb-8">Dashboard</h2>

            {statsLoading && (
              <p className="text-elvar-muted font-body text-sm animate-pulse">Loading stats…</p>
            )}

            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {([
                  { label: 'Total Orders',    value: stats.total_orders.toString(),                      accent: false },
                  { label: 'Pending Orders',  value: stats.pending_orders.toString(),                    accent: stats.pending_orders > 0 },
                  { label: 'Total Revenue',   value: formatLKR(Number(stats.total_revenue)),             accent: true  },
                  { label: 'Active Products', value: stats.total_products.toString(),                    accent: false },
                  { label: 'Customers',       value: stats.total_customers.toString(),                   accent: false },
                ] as { label: string; value: string; accent: boolean }[]).map((card) => (
                  <div key={card.label} className="elvar-card p-6">
                    <p className="elvar-label mb-3">{card.label}</p>
                    <p className={'font-display text-3xl font-light ' + (card.accent ? 'text-elvar-gold' : 'text-elvar-cream')}>
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Overview 7-day sparkline chart ── */}
            {overviewChartData.length > 0 && (
              <div className="mt-8">
                <SalesChart
                  data={overviewChartData}
                  title="Last 7 Days"
                  subtitle="Revenue Trend"
                  height={260}
                />
              </div>
            )}

            <div className="mt-8 border border-elvar-border p-6">
              <p className="elvar-label mb-2">Quick Actions</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button onClick={() => setTab('orders')}      className="elvar-btn text-xs">View Orders</button>
                <button onClick={() => setTab('add_product')} className="elvar-btn text-xs">Add Product</button>
                <button onClick={fetchStats}                  className="elvar-btn-ghost text-xs">Refresh</button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ ORDERS ════════════════ */}
        {tab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-4xl font-light text-elvar-cream">All Orders</h2>
              <button onClick={fetchOrders} className="elvar-btn-ghost text-xs py-2">Refresh</button>
            </div>

            {ordersLoading && (
              <p className="text-elvar-muted font-body text-sm animate-pulse">Loading orders…</p>
            )}
            {!ordersLoading && orders.length === 0 && (
              <p className="text-elvar-muted font-body text-sm">No orders yet.</p>
            )}

            <div className="space-y-4">
              {orders.map((order) => {
                const items = parseOrderItems(order.items_json);
                return (
                  <div key={order.id} className="elvar-card p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-body text-sm font-medium text-elvar-cream">
                          Order #{order.id}
                          <span className={'ml-3 text-xs ' + (STATUS_COLORS[order.status] || 'text-elvar-muted')}>
                            {order.status}
                          </span>
                        </p>
                        <p className="font-body text-xs text-elvar-muted mt-0.5">
                          {order.customer_name} &middot; {order.customer_email}
                        </p>
                        <p className="font-body text-xs text-elvar-muted mt-0.5">{fmt(order.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={statusUpdating === order.id || order.status === 'Delivered' || order.status === 'Cancelled'}
                          className="bg-elvar-surface border border-elvar-border text-elvar-cream font-body text-xs py-2 px-3 outline-none cursor-pointer disabled:opacity-50 focus:border-elvar-gold"
                        >
                          {VALID_STATUSES.map((s) => (
                            <option key={s} value={s} style={{ background: '#1a1714' }}>{s}</option>
                          ))}
                        </select>
                        <button onClick={() => setInvoiceOrder(order)} className="elvar-btn text-xs py-2 px-4">
                          View Invoice
                        </button>
                        {statusUpdating === order.id && (
                          <span className="text-elvar-muted text-xs font-body animate-pulse">Saving…</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {items.map((item, index) => (
                        <p key={index} className="font-body text-xs text-elvar-muted">
                          {item.title} — {item.size} × {item.quantity} @ {formatLKR(item.unit_price)}
                        </p>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-body border-t border-elvar-border pt-3">
                      <span className="text-elvar-muted">{order.payment_method}</span>
                      {order.delivery_district && <span className="text-elvar-muted">{order.delivery_district}</span>}
                      <span className="text-elvar-muted">Shipping: {formatLKR(Number(order.shipping_fee))}</span>
                      <span className="text-elvar-gold ml-auto font-medium">{formatLKR(Number(order.total_price))}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════ PRODUCTS ════════════════ */}
        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-4xl font-light text-elvar-cream">All Products</h2>
              <div className="flex gap-3">
                <button onClick={fetchProducts} className="elvar-btn-ghost text-xs py-2">Refresh</button>
                <button onClick={() => setTab('add_product')} className="elvar-btn text-xs py-2">+ Add Product</button>
              </div>
            </div>

            {productsLoading && (
              <p className="text-elvar-muted font-body text-sm animate-pulse">Loading products…</p>
            )}

            <div className="elvar-card p-6 mb-8">
              <p className="elvar-label mb-4">Quick Stock Update</p>
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <p className="elvar-label text-xs mb-1">Product ID</p>
                  <input type="number" value={stockProductId} onChange={(e) => setStockProductId(e.target.value)}
                    placeholder="e.g. 3"
                    className="bg-elvar-surface border border-elvar-border text-elvar-cream font-body text-sm py-2 px-3 w-28 outline-none focus:border-elvar-gold"
                  />
                </div>
                <div>
                  <p className="elvar-label text-xs mb-1">Size</p>
                  <select value={stockSize} onChange={(e) => setStockSize(e.target.value)}
                    className="bg-elvar-surface border border-elvar-border text-elvar-cream font-body text-sm py-2 px-3 outline-none cursor-pointer focus:border-elvar-gold"
                  >
                    {SIZES.map((s) => <option key={s} value={s} style={{ background: '#1a1714' }}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <p className="elvar-label text-xs mb-1">Quantity</p>
                  <input type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)}
                    placeholder="0" min="0"
                    className="bg-elvar-surface border border-elvar-border text-elvar-cream font-body text-sm py-2 px-3 w-24 outline-none focus:border-elvar-gold"
                  />
                </div>
                <button onClick={handleStockUpdate} className="elvar-btn text-xs py-2 px-5">Update</button>
              </div>
              {stockMsg && (
                <p className={'text-xs font-body mt-3 ' + (stockMsg.ok ? 'text-green-400' : 'text-red-400')}>
                  {stockMsg.text}
                </p>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm font-body">
                <thead>
                  <tr className="border-b border-elvar-border">
                    {['ID', 'Title', 'Category', 'Price', 'Status', 'Stock', 'Actions'].map((h) => (
                      <th key={h} className="text-left text-xs tracking-widest uppercase text-elvar-muted py-3 px-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const stock: StockEntry[] = Array.isArray(p.stock) ? p.stock.filter((s) => s && s.size) : [];
                    const totalStock = stock.reduce((acc, s) => acc + (s.quantity || 0), 0);
                    return (
                      <tr key={p.id} className="border-b border-elvar-border/50 hover:bg-elvar-surface/50 transition-colors">
                        <td className="py-4 px-3 text-elvar-muted">{p.id}</td>
                        <td className="py-4 px-3 text-elvar-cream max-w-xs truncate">{p.title}</td>
                        <td className="py-4 px-3 text-elvar-muted capitalize">{p.category}</td>
                        <td className="py-4 px-3 text-elvar-gold">{formatLKR(Number(p.price))}</td>
                        <td className="py-4 px-3">
                          <span className={'text-xs ' + (p.is_active ? 'text-green-400' : 'text-red-400')}>
                            {p.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-elvar-muted">{totalStock} units</td>
                        <td className="py-4 px-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setEditForm({
                                title: p.title,
                                description: p.description,
                                price: p.price,
                                category: p.category,
                                image_url: p.image_url,
                                is_active: p.is_active,
                              });
                              setEditError(''); setEditSuccess('');
                            }}
                            className="text-elvar-gold hover:text-elvar-gold-light text-xs uppercase tracking-widest transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-rose-500 hover:text-rose-400 text-xs uppercase tracking-widest transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {editingProduct && (
              <div className="fixed inset-0 bg-elvar-bg/90 z-50 flex items-center justify-center p-6 overflow-y-auto">
                <div className="elvar-card p-8 w-full max-w-lg max-h-screen overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-2xl text-elvar-cream">Edit Product #{editingProduct.id}</h3>
                    <button onClick={() => setEditingProduct(null)} className="text-elvar-muted hover:text-elvar-cream text-xl">&times;</button>
                  </div>
                  <div className="space-y-5">
                    {([
                      { label: 'Title',     key: 'title',     type: 'text'   },
                      { label: 'Price',     key: 'price',     type: 'number' },
                      { label: 'Category',  key: 'category',  type: 'text'   },
                      { label: 'Image URL', key: 'image_url', type: 'text'   },
                    ] as { label: string; key: keyof Product; type: string }[]).map((field) => (
                      <div key={field.key}>
                        <label className="elvar-label">{field.label}</label>
                        <input
                          type={field.type}
                          value={(editForm[field.key] as string | number) ?? ''}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              [field.key]: field.type === 'number' ? parseFloat(e.target.value) : e.target.value,
                            }))
                          }
                          className="elvar-input"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="elvar-label">Description</label>
                      <textarea
                        value={(editForm.description as string) ?? ''}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full bg-transparent border-b border-elvar-border text-elvar-cream font-body text-sm py-3 px-0 outline-none placeholder-elvar-muted resize-none focus:border-elvar-gold"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox" id="is-active"
                        checked={Boolean(editForm.is_active)}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))}
                        className="accent-elvar-gold"
                      />
                      <label htmlFor="is-active" className="font-body text-sm text-elvar-cream cursor-pointer">
                        Product is active (visible on store)
                      </label>
                    </div>
                    {editError   && <p className="text-red-400   text-xs font-body">{editError}</p>}
                    {editSuccess && <p className="text-green-400 text-xs font-body">{editSuccess}</p>}
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSaveEdit}              className="elvar-btn flex-1">Save Changes</button>
                      <button onClick={() => setEditingProduct(null)} className="elvar-btn-ghost flex-1">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════ ADD PRODUCT ════════════════ */}
        {tab === 'add_product' && (
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl font-light text-elvar-cream mb-8">Add New Product</h2>
            <div className="space-y-7">
              <div>
                <label className="elvar-label">Product Title *</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Handwoven Batik Saree" className="elvar-input" />
              </div>
              <div>
                <label className="elvar-label">Description</label>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3}
                  placeholder="Optional product description..."
                  className="w-full bg-transparent border-b border-elvar-border text-elvar-cream font-body text-sm py-3 px-0 outline-none placeholder-elvar-muted resize-none focus:border-elvar-gold transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="elvar-label">Price (LKR) *</label>
                  <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="e.g. 4500" min="0" step="0.01" className="elvar-input" />
                </div>
                <div>
                  <label className="elvar-label">Category *</label>
                  <select value={newCategoryId ?? ''}
                    onChange={(e) => setNewCategoryId(e.target.value ? parseInt(e.target.value, 10) : null)}
                    className="w-full bg-elvar-card border-b border-elvar-border text-elvar-cream font-body text-sm py-3 px-0 outline-none cursor-pointer focus:border-elvar-gold"
                  >
                    {categoriesLoading && <option value="">Loading categories…</option>}
                    {!categoriesLoading && categories.length === 0 && <option value="">No categories</option>}
                    {!categoriesLoading && categories.map((c) => (
                      <option key={c.id} value={c.id} className="capitalize" style={{ background: '#211e1a' }}>{c.name}</option>
                    ))}
                  </select>
                  <div className="mt-3 flex items-center gap-3">
                    <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Add category (e.g. Winter Wear)" className="elvar-input flex-1" />
                    <button
                      onClick={async () => {
                        setCategoryError(''); setCategorySuccess('');
                        if (!newCategoryName.trim()) { setCategoryError('Name is required.'); return; }
                        setCategorySaving(true);
                        try {
                          const res = await fetch(apiUrl(`/api/admin/categories/add`), {
                            method: 'POST', headers: authHeader(),
                            body: JSON.stringify({ name: newCategoryName.trim() }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            setCategorySuccess('Category added.');
                            setNewCategoryName('');
                            await fetchCategories();
                            if (data.category?.id) setNewCategoryId(data.category.id);
                          } else {
                            setCategoryError(data.message || 'Failed to add category.');
                          }
                        } catch { setCategoryError('Network error.'); }
                        finally { setCategorySaving(false); }
                      }}
                      disabled={categorySaving}
                      className="elvar-btn px-4 text-sm"
                    >
                      {categorySaving ? 'Adding…' : 'Add Category'}
                    </button>
                  </div>
                  {categoryError   && <p className="text-red-400   text-xs mt-2">{categoryError}</p>}
                  {categorySuccess && <p className="text-green-400 text-xs mt-2">{categorySuccess}</p>}
                </div>
              </div>

              <div>
                <label className="elvar-label">Product Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full bg-transparent border-b border-elvar-border text-elvar-cream font-body text-sm py-3 px-0 outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-body file:bg-elvar-gold file:text-elvar-bg file:cursor-pointer hover:file:bg-elvar-gold-light" />
                {imageFile && <p className="text-xs text-elvar-muted mt-2">Selected: {imageFile.name}</p>}
              </div>

              <div>
                <label className="elvar-label">Product Size Chart (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setSizeChartFile(e.target.files?.[0] || null)}
                  className="w-full bg-transparent border-b border-elvar-border text-elvar-cream font-body text-sm py-3 px-0 outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-body file:bg-elvar-gold file:text-elvar-bg file:cursor-pointer hover:file:bg-elvar-gold-light" />
                {sizeChartFile && <p className="text-xs text-elvar-muted mt-2">Selected: {sizeChartFile.name}</p>}
              </div>

              <div>
                <p className="elvar-label mb-4">Stock Quantities by Size *</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {newStock.map((entry, index) => (
                    <div key={entry.size} className="text-center">
                      <p className="font-body text-xs text-elvar-muted mb-2">{entry.size}</p>
                      <input type="number" value={entry.quantity}
                        onChange={(e) => {
                          const updated = [...newStock];
                          updated[index] = { ...entry, quantity: e.target.value };
                          setNewStock(updated);
                        }}
                        min="0"
                        className="w-full bg-elvar-surface border border-elvar-border text-elvar-cream text-center font-body text-sm py-2 px-1 outline-none focus:border-elvar-gold transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {addError   && <div className="border border-red-800/60   bg-red-900/10   p-4"><p className="text-red-400   text-xs font-body">{addError}</p></div>}
              {addSuccess && <div className="border border-green-800/60 bg-green-900/10 p-4"><p className="text-green-400 text-xs font-body">{addSuccess}</p></div>}

              <button onClick={handleAddProduct} disabled={addLoading} className="elvar-btn px-12">
                {addLoading ? 'Adding Product…' : 'Add Product to Store'}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════ REPORTS ════════════════ */}
        {tab === 'reports' && (
          <div>
            <h2 className="font-display text-4xl font-light text-elvar-cream mb-8">Sales Reports</h2>

            {/* Date Filters */}
            <div className="elvar-card p-6 mb-8">
              <p className="elvar-label mb-4">Filter by Date Range</p>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="elvar-label text-xs mb-2 block">From</label>
                  <input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)}
                    className="bg-elvar-surface border border-elvar-border text-elvar-cream font-body text-sm py-2 px-3 outline-none focus:border-elvar-gold" />
                </div>
                <div>
                  <label className="elvar-label text-xs mb-2 block">To</label>
                  <input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)}
                    className="bg-elvar-surface border border-elvar-border text-elvar-cream font-body text-sm py-2 px-3 outline-none focus:border-elvar-gold" />
                </div>
                <button onClick={handleApplyDateFilter} className="elvar-btn text-xs py-2 px-5">Filter</button>
                <button
                  onClick={() => { setReportStartDate(''); setReportEndDate(''); fetchSalesReport(); }}
                  className="elvar-btn-ghost text-xs py-2 px-5"
                >
                  Reset
                </button>
              </div>
            </div>

            {reportLoading && (
              <p className="text-elvar-muted font-body text-sm animate-pulse">Loading report…</p>
            )}

            {reportData && (
              <>
                {/* ── Summary Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="elvar-card p-6">
                    <p className="elvar-label mb-3">Total Revenue</p>
                    <p className="font-display text-4xl font-light text-elvar-gold">
                      {formatLKR(Number(reportData.totalRevenue))}
                    </p>
                  </div>
                  <div className="elvar-card p-6">
                    <p className="elvar-label mb-3">Total Orders</p>
                    <p className="font-display text-4xl font-light text-elvar-cream">
                      {reportData.totalOrders}
                    </p>
                  </div>
                </div>

                {/* ══════════════════════════════════════════
                    SALES CHART — drop-in right here
                    chartData is derived from reportData.salesData
                    via the aggregateToChartData() helper above.
                ══════════════════════════════════════════ */}
                {chartData.length > 0 ? (
                  <div className="mb-8">
                    <SalesChart
                      data={chartData}
                      title="Revenue by Day"
                      subtitle="Filtered Period"
                      height={340}
                    />
                  </div>
                ) : (
                  !reportLoading && (
                    <div className="elvar-card p-8 mb-8 flex items-center justify-center">
                      <p className="text-elvar-muted font-body text-sm">
                        No chart data available for the selected range.
                      </p>
                    </div>
                  )
                )}

                {/* CSV Export */}
                <div className="mb-6">
                  <button onClick={downloadCSV} className="elvar-btn text-xs py-2 px-6">
                    📥 Export to CSV
                  </button>
                </div>

                {/* ── Sales Table ── */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm font-body">
                    <thead>
                      <tr className="border-b border-elvar-border">
                        {['Order ID', 'Date', 'Customer', 'Amount (LKR)', 'Payment Method', 'Status'].map((h) => (
                          <th key={h} className="text-left text-xs tracking-widest uppercase text-elvar-muted py-3 px-3 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.salesData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 px-3 text-center text-elvar-muted text-xs">
                            No sales data found for the selected date range.
                          </td>
                        </tr>
                      ) : (
                        reportData.salesData.map((order) => (
                          <tr key={order.order_id} className="border-b border-elvar-border/50 hover:bg-elvar-surface/50 transition-colors">
                            <td className="py-4 px-3 text-elvar-cream font-medium">#{order.order_id}</td>
                            <td className="py-4 px-3 text-elvar-muted">{new Date(order.created_at).toLocaleDateString('en-GB')}</td>
                            <td className="py-4 px-3 text-elvar-cream">{order.customer_name}</td>
                            <td className="py-4 px-3 text-elvar-gold font-medium">{formatLKR(Number(order.total_price))}</td>
                            <td className="py-4 px-3 text-elvar-muted">{order.payment_method}</td>
                            <td className="py-4 px-3">
                              <span className={
                                'text-xs font-medium ' +
                                (order.status === 'Delivered' ? 'text-green-400' :
                                 order.status === 'Cancelled' ? 'text-red-400' :
                                 order.status === 'Shipped'   ? 'text-purple-400' :
                                 order.status === 'Processing'? 'text-blue-400' :
                                 'text-yellow-400')
                              }>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* ── Invoice Modal ── */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="mx-auto max-w-6xl">
            <OrderInvoice
              orderId={invoiceOrder.id}
              orderDate={invoiceOrder.created_at}
              status={invoiceOrder.status}
              customerName={invoiceOrder.customer_name}
              customerEmail={invoiceOrder.customer_email}
              shippingAddress={invoiceOrder.delivery_district || 'Pickup / self collection'}
              paymentMethod={invoiceOrder.payment_method}
              items={invoiceItems.map((item) => ({
                description: item.title,
                size: item.size,
                quantity: item.quantity,
                unitPrice: item.unit_price,
                total: item.quantity * item.unit_price,
              }))}
              subtotal={invoiceItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)}
              discount={0}
              vat={0}
              totalAmount={Number(invoiceOrder.total_price)}
              notes="Thank you for choosing Élvar Clothing."
              onClose={() => setInvoiceOrder(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;