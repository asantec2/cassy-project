import type Cart from "./Cart.ts";


export default interface Coupon{
    applyCoupon(cart:Cart): void;
    getName():string;
}