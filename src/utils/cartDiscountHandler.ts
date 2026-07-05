// ─────────────────────────────────────────────────────────────────
//  utils/cartDiscountHandler.ts  |  Cart Price Update Logic
//  Handles edge cases when discounts expire while items are in cart
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { useCart } from "../contexts/CartContext";
import { apiUrl } from "../config/api";

/**
 * Cart Item Structure
 */
export interface CartItem {
  product_id: number;
  title: string;
  price: number; // The price when item was added (could be discount price)
  quantity: number;
  size?: string;
  original_price?: number;
  is_discount_active?: boolean;
  discount_end_date?: string;
}

/**
 * Discount Expiry Check Result
 */
export interface DiscountCheckResult {
  product_id: number;
  expired: boolean;
  old_price: number;
  new_price: number;
  price_changed: boolean;
  discount_end_date?: string;
}

/**
 * useCartDiscountSync Hook
 *
 * Syncs cart prices with server to handle discount expirations
 *
 * Features:
 * 1. Detects when discount has expired for cart items
 * 2. Updates cart with current prices from server
 * 3. Notifies user if prices changed
 * 4. Prevents checkout with stale prices
 *
 * Usage:
 * ```
 * const { checkCartPrices, hasExpiredDiscounts } = useCartDiscountSync();
 *
 * // Check prices before checkout
 * const result = await checkCartPrices();
 * if (result.hasChanges) {
 *   showNotification("Some prices have changed");
 *   // Cart will auto-update
 * }
 * ```
 */
export const useCartDiscountSync = () => {
  const { cartItems, updateCartItemPrice } = useCart() as any;

  /**
   * Check current prices against server and update if changed
   * Returns array of products with expired discounts
   */
  const checkCartPrices = async (): Promise<{
    hasChanges: boolean;
    expiredItems: DiscountCheckResult[];
    totalPriceDifference: number;
  }> => {
    if (!cartItems || cartItems.length === 0) {
      return { hasChanges: false, expiredItems: [], totalPriceDifference: 0 };
    }

    try {
      const expiredItems: DiscountCheckResult[] = [];
      let totalPriceDifference = 0;

      // Fetch current prices for all cart items
      for (const item of cartItems) {
        try {
          const res = await fetch(apiUrl(`/api/products/${item.product_id}`));
          const data = await res.json();

          if (data.success && data.product) {
            const product = data.product;
            const oldPrice = item.price;
            const newPrice = product.current_price;

            // Check if price changed (discount expired or new discount added)
            if (oldPrice !== newPrice) {
              const priceChange = newPrice - oldPrice;
              totalPriceDifference += priceChange * item.quantity;

              expiredItems.push({
                product_id: item.product_id,
                expired: !product.is_discount_active && item.is_discount_active,
                old_price: oldPrice,
                new_price: newPrice,
                price_changed: true,
                discount_end_date: product.discount_end_date,
              });

              // Update cart with new price
              updateCartItemPrice(item.product_id, newPrice);
            }
          }
        } catch (err) {
          console.error(`Failed to check price for product ${item.product_id}:`, err);
        }
      }

      return {
        hasChanges: expiredItems.length > 0,
        expiredItems,
        totalPriceDifference: Math.round(totalPriceDifference * 100) / 100,
      };
    } catch (err) {
      console.error("[useCartDiscountSync] Error checking prices:", err);
      return { hasChanges: false, expiredItems: [], totalPriceDifference: 0 };
    }
  };

  /**
   * Get items with expired discounts
   */
  const getExpiredDiscountItems = (): CartItem[] => {
    if (!cartItems) return [];

    return cartItems.filter(
      (item: CartItem) =>
        item.is_discount_active &&
        item.discount_end_date &&
        new Date(item.discount_end_date) <= new Date()
    );
  };

  /**
   * Auto-sync on mount and periodically
   */
  React.useEffect(() => {
    // Check prices on component mount
    checkCartPrices();

    // Re-check every 2 minutes while cart is open
    const interval = setInterval(() => {
      checkCartPrices();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [cartItems]);

  return {
    checkCartPrices,
    getExpiredDiscountItems,
    hasExpiredDiscounts: getExpiredDiscountItems().length > 0,
  };
};

/**
 * Utility function: Format price change message for user
 *
 * Usage:
 * const msg = formatPriceChangeMessage(result.totalPriceDifference);
 */
export const formatPriceChangeMessage = (priceDifference: number): string => {
  if (priceDifference === 0) {
    return "Your cart prices remain unchanged.";
  }

  const sign = priceDifference > 0 ? "increased" : "decreased";
  const amount = Math.abs(priceDifference).toFixed(2);

  return `Your cart total has ${sign} by LKR ${amount} due to discount changes.`;
};

/**
 * Utility function: Generate discount expiry warning
 *
 * Usage:
 * const warning = getExpiryWarning(product);
 */
export const getExpiryWarning = (product: any): string | null => {
  if (!product.discount_end_date || !product.is_discount_active) {
    return null;
  }

  const endDate = new Date(product.discount_end_date);
  const now = new Date();
  const hoursRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60));

  if (hoursRemaining < 0) {
    return "Discount has expired. Price will update at checkout.";
  }

  if (hoursRemaining < 1) {
    return "Discount expires in less than an hour!";
  }

  if (hoursRemaining < 24) {
    return `Discount expires in ${hoursRemaining} hours.`;
  }

  const daysRemaining = Math.ceil(hoursRemaining / 24);
  return `Discount expires in ${daysRemaining} days.`;
};

/**
 * Middleware for checkout: Validate cart prices before payment
 *
 * Usage:
 * const isValid = await validateCartPricesBeforeCheckout(cartItems);
 * if (!isValid) {
 *   showError("Please review your cart - prices have changed");
 *   return;
 * }
 */
export const validateCartPricesBeforeCheckout = async (
  cartItems: CartItem[]
): Promise<boolean> => {
  if (!cartItems || cartItems.length === 0) {
    return true;
  }

  try {
    for (const item of cartItems) {
      const res = await fetch(apiUrl(`/api/products/${item.product_id}`));
      const data = await res.json();

      if (!data.success || !data.product) {
        console.error(`Product ${item.product_id} not found`);
        return false;
      }

      // Verify current price matches cart price
      if (item.price !== data.product.current_price) {
        console.warn(
          `Price mismatch for product ${item.product_id}: ` +
            `cart has ${item.price}, server has ${data.product.current_price}`
        );
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error("[validateCartPricesBeforeCheckout] Error:", err);
    return false;
  }
};
