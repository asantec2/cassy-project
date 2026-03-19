/**
 * The {@code ReceiptView} class represents the user interface for displaying a {@link Receipt}.
 * It shows purchased {@link Product} items, the total cost, and provides navigation back to the cart.
 */

import Cart from "../model/Cart.ts";
import CartView from "../View/CartView.ts";
import Product from "../model/Product.ts";
import ReceiptView from "../View/ReceiptView.ts";
import Smoothie from "../model/Smoothie.ts";
import Juice from "../model/Juice.ts";
import Cashier from "../model/Cashier.ts";
import type Coupon from "../model/Coupon.ts";
import Receipt from "../model/Receipt.ts";
import BOGO from "../model/BOGO.ts";
import Percent25 from "../model/Percent25.ts";
import FrozenYogurt from "../model/FrozenYogurt.ts";


export default class CartController {
    #cart: Cart;
    // @ts-ignore
    #cartView: CartView;
    #cashier: Cashier;


    //constrictor
    constructor(cashier:Cashier) {
        this.#cashier = cashier;
        this.#cart = new Cart();
        this.#cartView = new CartView(this.#cart, this);
    }

    /**
     * Adds a product to the cart.
     * @param product the product to be added to the cart
     * @param amount
     */
    addToCart(product: Product,amount : number) {
        this.#cart.addProduct(product,amount);

    }

    /**
     * Removes a product from the cart.
     * @param product the product to be removed from the cart
     * @param amount
     */
    removeFromCart(product: Product, amount: number) {
        this.#cart.removeProduct(product,amount);

    }
    addCouponToCart(coupon: Coupon) {
        this.#cart.addCoupon(coupon);
    }
    removeCouponFromCart(coupon: Coupon) {
        this.#cart.removeCoupon(coupon);
    }
    addBOGO() {
        this.addCouponToCart(new BOGO("BOGO", "buy one get one free"));
    }

    removeBOGO() {
        this.removeCouponFromCart(new BOGO("BOGO", "buy one get one free"));
    }

    addPercent25() {
        this.addCouponToCart(new Percent25("PERCENT25", "25 percent off"));
    }

    removePercent25() {
        this.removeCouponFromCart(new Percent25("PERCENT25", "25 percent off"));
    }

    /**
     * Creates a Smoothie and adds it to the cart.
     */
    addSmoothie() {
        this.addToCart(new Smoothie("Strawberry Sunshine", 10,20),1);
    }

    /**
     * Creates a Smoothie and removes it from the cart.
     */
    removeSmoothie() {
        this.removeFromCart(new Smoothie("Strawberry Sunshine", 10,20),1);
    }

    /**
     * Creates a Juice and adds it to the cart.
     */
    addJuice() {
        this.addToCart(new Juice("Orange Juice", 15,20),1);
    }

    /**
     * Creates a Juice and removes it from the cart.
     */
    removeJuice() {
        this.removeFromCart(new Juice("Orange Juice", 15,20),1);
    }

    addFroyo(amount:number){
        this.addToCart(new FrozenYogurt("Vanilla Froyo",12,500),amount);
    }

    removeFroyo(amount: number){
        this.removeFromCart(new FrozenYogurt("Vanilla Froyo",12,500),amount);
    }

    /**
     * Completes the checkout process and displays the receipt.
     */
    async checkOut() {
        const receipt = this.#cart.checkOut(this.#cashier);
        await Cart.saveCart(this.#cart);
        await Receipt.saveReceipt(receipt);
        new ReceiptView(receipt, this);
    }

    /**
     * Displays the cart view so the user can continue shopping.
     */
    showCartView() {
        this.#cartView = new CartView(this.#cart, this);
    }
}