import {expect, test} from "vitest";
import Percent25, {InvalidPercentApplicationException} from "../src/model/Percent25";
import Cart from "../src/model/Cart";
import Smoothie from "../src/model/Smoothie";
import BOGO, {InvalidBOGOApplicationException} from "../src/model/BOGO";

test('Can apply Percent25 to cart', ()=>{
    let coupon = new Percent25("Percent25","get 25% off");
    let cart = new Cart();
    let product = new Smoothie("Strawberry Sunshine",6,10);
    cart.addProduct(product,1)
     coupon.applyCoupon(cart);
    expect(cart.getTotal()).toBe(5);
});
test('Can apply BOGO to cart', ()=>{
    let coupon = new BOGO("BOGO","buy one get one free");
    let cart = new Cart();
    let product = new Smoothie("Strawberry Sunshine",6,10);
    cart.addProduct(product,2)
    coupon.applyCoupon(cart);
    expect(cart.getTotal()).toBe(6);
});
test(' Percent25 throws exception when applied to empty cart', ()=>{
    let coupon = new Percent25("Percent25","get 25% off");
    let cart = new Cart();
    let exception = false;

    try {
        coupon.applyCoupon(cart);
    } catch (e) {
        if (e instanceof InvalidPercentApplicationException) {
            exception = true;
        } else {
            console.log("unexpected error" + e);

        }
    }
    expect(exception).equals(true);

});
test(' BOGO throws exception when applied to empty cart', ()=>{
    let coupon = new BOGO("BOGO","buy one get one free");
    let cart = new Cart();
    let exception = false;

    try {
        coupon.applyCoupon(cart);
    } catch (e) {
        if (e instanceof InvalidBOGOApplicationException) {
            exception = true;
        } else {
            console.log("unexpected error" + e);
        }
    }
    expect(exception).equals(true);

});