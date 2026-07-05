import { useState, useEffect, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, formatLKR } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { apiUrl } from '../config/api';

declare global {
  interface Window {
    payhere?: any;
  }
}

const PAYHERE_MERCHANT_ID = import.meta.env.VITE_PAYHERE_MERCHANT_ID || '';
const PAYHERE_CURRENCY    = import.meta.env.VITE_PAYHERE_CURRENCY    || 'LKR';

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara',
  'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota',
  'Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya',
  'Puttalam', 'Kurunegala',
  'Anuradhapura', 'Polonnaruwa',
  'Badulla', 'Monaragala',
  'Ratnapura', 'Kegalle',
  'Ampara', 'Batticaloa', 'Trincomalee',
];

type PaymentMethod = 'COD' | 'Bank Transfer' | 'Store Pickup' | 'PayHere';

interface CheckoutFormProps {
  onSuccess: (orderId: number) => void;
  onCancel:  () => void;
}

const CheckoutForm = ({ onSuccess, onCancel }: CheckoutFormProps): ReactElement => {
  const { items, subtotal, deliveryDistrict, paymentMethod,
          setDeliveryDistrict, setPaymentMethod } = useCart();
  const { token, user } = useAuth();

  const [isSubmitting, setIsSubmitting]   = useState<boolean>(false);
  const [orderPlaced, setOrderPlaced]     = useState<boolean>(false);
  const [errorMsg, setErrorMsg]           = useState<string>('');
  const [completedOrder, setCompletedOrder] = useState<{ id: number; totalAmount: string } | null>(null);
  const [shippingFee, setShippingFee]     = useState<number>(0);
  const [shippingLoading, setShippingLoading] = useState<boolean>(false);

  const [customerName, setCustomerName]     = useState<string>(user?.name || '');
  const [phoneNumber, setPhoneNumber]       = useState<string>('');
  const [streetAddress, setStreetAddress]   = useState<string>('');
  const [city, setCity]                     = useState<string>('');
  const [postalCode, setPostalCode]         = useState<string>('');

  const selectedPayment = paymentMethod as PaymentMethod;
  const total           = subtotal + shippingFee;
  const navigate        = useNavigate();

  // ─── Shipping fee loader ────────────────────────────────────────────────────
  useEffect(() => {
    const loadShippingFee = async (): Promise<void> => {
      if (selectedPayment === 'Store Pickup') {
        setShippingFee(0);
        setShippingLoading(false);
        return;
      }

      if (!deliveryDistrict) {
        setShippingFee(0);
        setShippingLoading(false);
        return;
      }

      setShippingLoading(true);
      try {
        const res  = await fetch(
          apiUrl(`/api/orders/shipping-fee?district=${encodeURIComponent(deliveryDistrict)}`)
        );
        const data = await res.json();
        if (typeof data.shipping_fee === 'number') {
          setShippingFee(data.shipping_fee);
        } else {
          setShippingFee(0);
        }
      } catch {
        setShippingFee(0);
      } finally {
        setShippingLoading(false);
      }
    };

    loadShippingFee();
  }, [deliveryDistrict, selectedPayment]);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const buildOrderItems = () =>
    items.map(item => ({
      product_id: (item as any).product_id ?? (item as any).id,
      size:       (item.size || 'M').trim() || 'M',
      quantity:   Number(item.quantity) >= 1 ? Number(item.quantity) : 1,
    }));

  const validateOrderItems = () => {
    if (items.length === 0) {
      return { valid: false, message: 'Your cart is empty.' };
    }

    const invalidItem = items.find(item =>
      !((item as any).product_id ?? (item as any).id) ||
      !item.size ||
      item.size.trim().length === 0 ||
      typeof item.quantity !== 'number' ||
      item.quantity < 1
    );

    return invalidItem
      ? { valid: false, message: `Please select a valid size and quantity for "${invalidItem.title || 'one item'}".` }
      : { valid: true };
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (): Promise<void> => {
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (!token) {
        throw new Error('You must be logged in to place an order.');
      }

      if (
        !customerName.trim()   ||
        !phoneNumber.trim()    ||
        !streetAddress.trim()  ||
        !city.trim()           ||
        !postalCode.trim()
      ) {
        throw new Error(
          'Please enter your full name, phone number, street address, city, and postal code.'
        );
      }

      const validation = validateOrderItems();
      if (!validation.valid) {
        throw new Error(
          validation.message || 'Please fix invalid cart items before placing an order.'
        );
      }

      // ── 1. Create order ──────────────────────────────────────────────────────
      const payload = {
        items:             buildOrderItems(),
        payment_method:    selectedPayment,
        customer_name:     customerName.trim(),
        phone_number:      phoneNumber.trim(),
        street_address:    streetAddress.trim(),
        city:              city.trim(),
        postal_code:       postalCode.trim(),
        delivery_district: deliveryDistrict,
      };

      const response = await fetch(apiUrl('/api/orders/create'), {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Order failed. Please try again.');
      }

      const orderId = data.order.id;
      // amount MUST be a string formatted to exactly 2 decimal places for PayHere
      const amount  = Number(data.order.total_price).toFixed(2);

      // ── 2. PayHere flow ──────────────────────────────────────────────────────
      if (selectedPayment === 'PayHere') {

        // 2a. Request server-side hash (never generate this client-side)
        const hashResponse = await fetch(apiUrl('/api/payments/hash'), {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            order_id: orderId,
            amount,                       // same string that goes into the payload
            currency: PAYHERE_CURRENCY,
          }),
        });

        const hashData = await hashResponse.json();
        if (!hashResponse.ok || !hashData.success) {
          throw new Error(hashData.message || 'Could not generate PayHere hash.');
        }

        // 2b. Guard: SDK must be present
        if (typeof window === 'undefined') {
          throw new Error('PayHere SDK requires a browser environment.');
        }

        const payhere = window.payhere;
        if (!payhere) {
          throw new Error('PayHere SDK is not loaded. Please refresh the page.');
        }
        if (typeof payhere.startPayment !== 'function') {
          throw new Error('PayHere SDK startPayment method is not available.');
        }

        // 2c. Split name
        const [firstName, ...lastNameParts] = customerName.trim().split(' ');
        const lastName = lastNameParts.join(' ') || 'Customer';

        // 2d. Callbacks — use JSON.stringify so the error object is readable
        payhere.onCompleted = (completedOrderId: string) => {
          console.log('[PayHere] Payment completed:', { completedOrderId });
          setCompletedOrder({ id: Number(completedOrderId), totalAmount: amount });
          setOrderPlaced(true);
          onSuccess(Number(completedOrderId));
        };

        payhere.onDismissed = () => {
          console.warn('[PayHere] Payment window dismissed:', { orderId });
          setErrorMsg(
            'Payment window was closed. Your order remains pending until payment is completed.'
          );
        };

        payhere.onError = (error: any) => {
          // Serialize properly — String(error) on an object yields "[object Object]"
          const detail =
            typeof error === 'string'
              ? error
              : (error?.message ?? JSON.stringify(error));
          console.error('[PayHere] Payment error:', { orderId, detail });
          setErrorMsg(`PayHere error: ${detail}`);
        };

        // 2e. FIX: sandbox is a property on the SDK instance, NOT a payload field
        payhere.sandbox = true;

        // 2f. Build payload
        //   ▸ address, city, country were missing — PayHere requires all three
        //   ▸ amount  → string "1500.00"  (already set above)
        //   ▸ hash    → uppercase MD5 from backend
        const payHerePayload = {
          merchant_id: String(hashData.merchant_id || PAYHERE_MERCHANT_ID).trim(),
          return_url:  `${window.location.origin}/payment-success`,
          cancel_url:  `${window.location.origin}/payment-cancel`,
          notify_url:  apiUrl('/api/payments/notify'),
          order_id:    String(orderId).trim(),
          items:       `Order #${orderId}`,
          amount:      String(amount).trim(),       // "1500.00" — must be string, 2dp
          currency:    String(hashData.currency || PAYHERE_CURRENCY).trim().toUpperCase(),
          // ── Customer ────────────────────────────────────────────────────────
          first_name:  String(firstName).trim(),
          last_name:   String(lastName).trim(),
          email:       String(user?.email || '').trim(),
          phone:       String(phoneNumber).trim(),
          // ── Billing address (all three required by PayHere) ─────────────────
          address:     String(streetAddress).trim(),  // FIX: was missing
          city:        String(city).trim(),            // FIX: was missing
          country:     'Sri Lanka',                    // FIX: was missing
          // ── Optional custom fields ───────────────────────────────────────────
          custom_1:    String(user?.email || '').trim(),
          // ── Hash (uppercase MD5) ─────────────────────────────────────────────
          hash:        String(hashData.hash || '').trim(),
        };

        // 2g. Validate critical fields before firing
        const requiredFields = [
          'merchant_id', 'order_id', 'amount', 'currency',
          'first_name',  'last_name', 'phone',
          'address',     'city',     'country',
          'hash',
        ] as const;

        const missing = requiredFields.filter(
          f => !payHerePayload[f as keyof typeof payHerePayload]
        );

        if (missing.length > 0) {
          throw new Error(`Missing required PayHere fields: ${missing.join(', ')}`);
        }

        console.log('[PayHere] Initiating payment:', {
          ...payHerePayload,
          hash: '[REDACTED]',
        });

        // 2h. Fire
        payhere.startPayment(payHerePayload);

        // Return early — order completion is handled inside onCompleted callback
        return;
      }

      // ── 3. Non-PayHere success ───────────────────────────────────────────────
      setCompletedOrder({ id: orderId, totalAmount: amount });
      setOrderPlaced(true);

    } catch (err: any) {
      const message = err?.message || 'Order failed. Please try again.';
      setErrorMsg(message);
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Order placed screen ────────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="flex items-center justify-center py-24 px-6">
        <div className="text-center max-w-md">
          <div className="text-elvar-gold text-5xl mb-6">&#10003;</div>
          <h2 className="font-display text-4xl font-light text-elvar-cream mb-4">
            Order Placed Successfully!
          </h2>
          <p className="text-elvar-muted mb-6">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          <button
            onClick={() => {
              if (completedOrder) onSuccess(completedOrder.id);
              navigate('/');
            }}
            className="elvar-btn w-full mt-3"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ─── Main form ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-widest3 uppercase text-elvar-muted font-body mb-2">
          Step 3 of 3
        </p>
        <h2 className="font-display text-5xl font-light text-elvar-cream">Secure Checkout</h2>
        <div className="gold-line mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* ── LEFT — Delivery & Payment ── */}
        <div className="space-y-10">

          {/* Customer Info */}
          {user && (
            <div>
              <p className="elvar-label">Customer</p>
              <p className="text-elvar-cream font-body text-sm">{user.name}</p>
              <p className="text-elvar-muted font-body text-xs mt-0.5">{user.email}</p>
            </div>
          )}

          {/* Delivery Details */}
          <div className="space-y-6">
            <p className="elvar-label">Delivery Details</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.24em] text-elvar-muted">Full Name</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-2 w-full bg-elvar-card border border-elvar-border text-elvar-cream font-body text-sm py-3 px-4 rounded-xl outline-none focus:border-elvar-gold"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.24em] text-elvar-muted">Phone Number</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="mt-2 w-full bg-elvar-card border border-elvar-border text-elvar-cream font-body text-sm py-3 px-4 rounded-xl outline-none focus:border-elvar-gold"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.24em] text-elvar-muted">Street Address</span>
              <textarea
                value={streetAddress}
                onChange={e => setStreetAddress(e.target.value)}
                placeholder="House number, street, and apartment"
                rows={4}
                className="mt-2 w-full bg-elvar-card border border-elvar-border text-elvar-cream font-body text-sm py-3 px-4 rounded-3xl outline-none focus:border-elvar-gold resize-none"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.24em] text-elvar-muted">City / Town</span>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Colombo"
                  className="mt-2 w-full bg-elvar-card border border-elvar-border text-elvar-cream font-body text-sm py-3 px-4 rounded-xl outline-none focus:border-elvar-gold"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.24em] text-elvar-muted">Postal Code</span>
                <input
                  type="text"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="10000"
                  className="mt-2 w-full bg-elvar-card border border-elvar-border text-elvar-cream font-body text-sm py-3 px-4 rounded-xl outline-none focus:border-elvar-gold"
                />
              </label>
            </div>

            {selectedPayment !== 'Store Pickup' && (
              <>
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.24em] text-elvar-muted">District</span>
                  <div className="relative mt-2">
                    <select
                      value={deliveryDistrict}
                      onChange={e => setDeliveryDistrict(e.target.value)}
                      className="w-full bg-elvar-card border border-elvar-border text-elvar-cream font-body text-sm py-3 px-4 rounded-xl outline-none appearance-none cursor-pointer focus:border-elvar-gold"
                    >
                      {DISTRICTS.map(d => (
                        <option key={d} value={d} style={{ background: '#211e1a' }}>{d}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-elvar-gold text-xs">
                      &#9660;
                    </div>
                  </div>
                </label>
                <p className="text-xs text-elvar-muted mt-2 font-body">
                  {shippingLoading
                    ? 'Calculating shipping fee…'
                    : `Shipping fee for ${deliveryDistrict}: ${formatLKR(shippingFee)}`}
                </p>
              </>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <p className="elvar-label">Payment Method</p>
            <div className="space-y-3 mt-3">
              {(['COD', 'Bank Transfer', 'Store Pickup', 'PayHere'] as PaymentMethod[]).map(method => (
                <label
                  key={method}
                  className={
                    'flex items-start gap-4 p-4 border cursor-pointer transition-all duration-200 ' +
                    (selectedPayment === method
                      ? 'border-elvar-gold bg-elvar-gold/5'
                      : 'border-elvar-border hover:border-elvar-muted')
                  }
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={selectedPayment === method}
                      onChange={() => setPaymentMethod(method)}
                      className="accent-elvar-gold"
                    />
                  </div>
                  <div>
                    <p className="font-body text-sm text-elvar-cream font-medium">
                      {method === 'COD'           && 'Cash on Delivery'}
                      {method === 'Bank Transfer'  && 'Direct Bank Transfer'}
                      {method === 'Store Pickup'   && 'Store Pickup — Free'}
                      {method === 'PayHere'        && 'PayHere Online Payment'}
                    </p>
                    <p className="font-body text-xs text-elvar-muted mt-0.5">
                      {method === 'COD'           && 'Pay when your order arrives at your door.'}
                      {method === 'Bank Transfer'  && 'Transfer to our bank account before dispatch.'}
                      {method === 'Store Pickup'   && 'Collect from our boutique. No shipping fee.'}
                      {method === 'PayHere'        && 'Secure online payment via PayHere sandbox.'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Bank Transfer Details */}
          {selectedPayment === 'Bank Transfer' && (
            <div className="border border-white/10 bg-[#090908] p-6 rounded-[28px] shadow-[0_20px_60px_rgba(255,255,255,0.04)]">
              <p className="elvar-label text-elvar-gold mb-4">Bank Transfer Details</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-body text-elvar-muted">
                <span>Bank</span>
                <span className="text-elvar-cream">Commercial Bank of Ceylon</span>
                <span>Account Holder</span>
                <span className="text-elvar-cream">Élvar Clothing (Pvt) Ltd</span>
                <span>Account Number</span>
                <span className="text-elvar-cream tracking-wider">1234 5678 9012</span>
                <span>Branch</span>
                <span className="text-elvar-cream">Colombo 03</span>
              </div>
              <p className="text-xs text-elvar-muted mt-4 font-body leading-relaxed">
                Use the exact amount and reference your full name. Upload your bank transfer
                slip via WhatsApp after placing the order.
              </p>
            </div>
          )}

          {/* Store Pickup Info */}
          {selectedPayment === 'Store Pickup' && (
            <div className="border border-elvar-border p-6">
              <p className="elvar-label mb-4">Boutique Location</p>
              <div className="space-y-2 text-sm font-body">
                <p className="text-elvar-cream">42 Galle Road, Colombo 03</p>
                <p className="text-elvar-muted">Mon – Sat &nbsp;·&nbsp; 10:00 AM – 8:00 PM</p>
                <p className="text-elvar-muted">Sun &nbsp;·&nbsp; 11:00 AM – 6:00 PM</p>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT — Order Summary ── */}
        <div>
          <div className="elvar-card p-8 sticky top-24">
            <p className="elvar-label mb-6">Order Summary</p>

            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-elvar-surface flex-shrink-0 overflow-hidden">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-elvar-accent/30 to-elvar-gold/10" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-elvar-cream text-sm font-body truncate">{item.title}</p>
                    <p className="text-elvar-muted text-xs font-body mt-0.5">
                      Size {item.size} &nbsp;&middot;&nbsp; Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-elvar-cream text-sm font-body flex-shrink-0">
                    {formatLKR(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-elvar-border pt-6 space-y-3">
              <div className="flex justify-between text-sm font-body">
                <span className="text-elvar-muted">Subtotal</span>
                <span className="text-elvar-cream">{formatLKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-elvar-muted">Shipping</span>
                <span className={shippingFee === 0 ? 'text-elvar-gold' : 'text-elvar-cream'}>
                  {shippingLoading ? 'Calculating…' : shippingFee === 0 ? 'Free' : formatLKR(shippingFee)}
                </span>
              </div>
            </div>

            <div className="border-t border-elvar-gold/40 mt-4 pt-4 flex justify-between">
              <span className="font-display text-lg text-elvar-cream">Total</span>
              <span className="font-display text-xl text-elvar-gold">{formatLKR(total)}</span>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 border border-red-800/60 bg-red-900/10">
                <p className="text-red-400 text-xs font-body">{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
              className="elvar-btn w-full mt-6"
            >
              {isSubmitting ? 'Processing…' : 'Place Secure Order'}
            </button>

            <button
              onClick={onCancel}
              className="elvar-btn-ghost w-full mt-3"
            >
              Back to Cart
            </button>

            <p className="text-center text-xs text-elvar-muted font-body mt-4 leading-relaxed">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutForm;