import type { FC } from "react";
import { useProductPrice } from "../hooks/useProductPrice";

interface ProductPriceProps {
  product: {
    price?: number;
    original_price?: number;
    current_price?: number;
    is_discount_active?: boolean;
    discount_percentage?: number;
  };
  className?: string;
  variant?: "default" | "large";
}

const formatPrice = (amount: number): string => {
  return `LKR ${amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const ProductPrice: FC<ProductPriceProps> = ({
  product,
  className = "",
  variant = "default",
}) => {
  const { price, originalPrice, isDiscountActive, discountPercentage } = useProductPrice(product);
  const isLarge = variant === "large";

  const basePriceClass = isLarge
    ? "font-[var(--serif)] text-3xl md:text-4xl font-black"
    : "font-[var(--serif)] text-lg";

  const discountPriceClass = isLarge
    ? "font-[var(--serif)] text-4xl md:text-5xl font-black text-[#f55949]"
    : "font-[var(--serif)] text-lg text-[#f55949]";

  const originalPriceClass = isLarge
    ? "font-[var(--sans)] text-base md:text-lg text-[rgba(240,235,225,0.5)]"
    : "font-[var(--sans)] text-sm text-[rgba(240,235,225,0.5)]";

  if (!isDiscountActive || price >= originalPrice) {
    return (
      <div className={className}>
        <span className={`${basePriceClass} text-[var(--bone)]`}>
          {formatPrice(price)}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-baseline gap-3 ${className}`}>
      <span className="font-[var(--sans)] text-xs uppercase tracking-[0.24em] text-[#f55949]">
        -{Math.round(discountPercentage)}%
      </span>
      <del className={originalPriceClass}>{formatPrice(originalPrice)}</del>
      <span className={discountPriceClass}>{formatPrice(price)}</span>
    </div>
  );
};
