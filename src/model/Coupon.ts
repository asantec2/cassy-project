/**
 * The {@code Coupon} represents a discount that can be applied to a {@link Cart}.
 * It defines the structure for all coupon types,and how they modify the cart total when applied.
 */

import type Cart from "./Cart.ts";


export default interface Coupon {
    applyCoupon(cart: Cart): void;

    getName(): string;
}