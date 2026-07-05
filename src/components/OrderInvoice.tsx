import React from 'react';

export interface InvoiceItem {
  description: string;
  size: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderInvoiceProps {
  orderId: number | string;
  orderDate: string | Date;
  status: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
  items: InvoiceItem[];
  subtotal?: number;
  discount?: number;
  vat?: number;
  totalAmount: number;
  notes?: string;
  onClose?: () => void;
}

const formatLKR = (value: number) =>
  `LKR ${value.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const OrderInvoice: React.FC<OrderInvoiceProps> = ({
  orderId, orderDate, status, customerName, customerEmail, shippingAddress, 
  paymentMethod, items, subtotal, discount = 0, vat = 0, totalAmount, notes, onClose
}) => {
  const computedSubtotal = subtotal ?? items.reduce((sum, item) => sum + item.total, 0);
  const computedTotal = totalAmount ?? computedSubtotal - discount + vat;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-root, #invoice-root * { visibility: visible; }
          #invoice-root { position: absolute; left: 0; top: 0; width: 100%; color: black !important; }
          .no-print { display: none !important; }
          #invoice-root { border: none !important; }
        }
      `}</style>

      <div id="invoice-root" className="w-full max-w-3xl bg-white p-10 text-black border border-gray-300 shadow-xl">
        {/* Header */}
        <div className="flex justify-between border-b-2 border-black pb-4 mb-6">
          <h1 className="text-4xl font-bold uppercase">Invoice</h1>
          <div className="text-right">
            <h2 className="text-xl font-bold">ÉLVAR CLOTHING</h2>
            <p className="text-sm">Premium Island Couture</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <p><strong>Invoice No:</strong> #ELV-{orderId}</p>
            <p><strong>Date:</strong> {formatDate(orderDate)}</p>
            <div className="mt-4">
              <p className="font-bold border-b border-black inline-block">BILL TO:</p>
              <p className="font-semibold mt-1">{customerName}</p>
              <p>{customerEmail}</p>
              <p className="whitespace-pre-line">{shippingAddress}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold border-b border-black inline-block">PAYMENT INFO</p>
            <p className="mt-1">Method: {paymentMethod}</p>
            <p>Status: {status}</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full mb-8 text-sm border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-2 text-left">No</th>
              <th className="p-2 text-left">Product Description</th>
              <th className="p-2 text-right">Unit Price</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-300">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{item.description} (Size: {item.size})</td>
                <td className="p-2 text-right">{formatLKR(item.unitPrice)}</td>
                <td className="p-2 text-right">{item.quantity}</td>
                <td className="p-2 text-right">{formatLKR(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Info */}
        <div className="flex justify-between items-start mt-8">
          <div className="text-xs w-1/2">
            <p className="font-bold border-b border-black inline-block">TERMS & CONDITION</p>
            <p className="mt-1">{notes || "Payment is due upon receipt. Thank you for choosing Élvar Clothing."}</p>
          </div>
          <div className="w-1/3">
            <div className="flex justify-between border-b border-gray-300 py-1"><span>Subtotal:</span> <span>{formatLKR(computedSubtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between border-b border-gray-300 py-1"><span>Discount:</span> <span>-{formatLKR(discount)}</span></div>}
            <div className="flex justify-between py-2 font-bold text-lg"><span>Grand Total:</span> <span>{formatLKR(computedTotal)}</span></div>
          </div>
        </div>

        {/* Signature */}
        <div className="mt-16 flex justify-between items-center">
          <p className="text-sm">Thank you for your business!</p>
          <div className="text-center">
            <div className="w-40 border-b border-black mb-1"></div>
            <p className="text-sm font-bold">Signature</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex gap-4 no-print">
          <button onClick={() => window.print()} className="flex-1 rounded bg-black py-3 font-semibold text-white hover:bg-gray-800">Print Invoice</button>
          {onClose && <button onClick={onClose} className="rounded border border-black px-6 py-3 hover:bg-gray-100">Close</button>}
        </div>
      </div>
    </div>
  );
};

export default OrderInvoice;