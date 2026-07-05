// ─────────────────────────────────────────────────────────────────
//  hooks/useProductPrice.ts  |  React Hook for Discount Pricing
//  Returns normalized price metadata for storefront components
// ─────────────────────────────────────────────────────────────────
"use strict";

import { useMemo } from "react";

interface ProductPriceInput {
  price?: number;
  original_price?: number;
  current_price?: number;
  is_discount_active?: boolean;
  discount_percentage?: number;
}

interface ProductPriceOutput {
  price: number;
  originalPrice: number;
  isDiscountActive: boolean;
  discountPercentage: number;
}

export const useProductPrice = (
  product: ProductPriceInput | null | undefined
): ProductPriceOutput => {
  return useMemo(() => {
    const originalPrice = product?.original_price ?? product?.price ?? 0;
    const currentPrice = product?.current_price ?? originalPrice;
    const isDiscountActive = Boolean(product?.is_discount_active && currentPrice < originalPrice);
    const discountPercentage = product?.discount_percentage ?? 0;

    return {
      price: currentPrice,
      originalPrice,
      isDiscountActive,
      discountPercentage,
    };
  }, [product]);
};
