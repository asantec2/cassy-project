/**
 * The {@code CartController} class manages user interactions with the {@link Cart}.
 * It handles adding and removing products, applying and removing coupons,
 * and coordinating the checkout process between the {@link Cart} model and the views.
 */

import Cart from "../model/Cart.ts";
import CartView from "../View/CartView.ts";
import Product from "../model/Product.ts";
import ReceiptView from "../View/ReceiptView.ts";
import Smoothie from "../model/Smoothie.ts";
import Juice from "../model/Juice.ts";
import Cashier from "../model/Cashier.ts";
import type Coupon from "../model/Coupon.ts";
import BOGO from "../model/BOGO.ts";
import Percent25 from "../model/Percent25.ts";
import FrozenYogurt from "../model/FrozenYogurt.ts";


export default class CartController {
    #cart: Cart;
    // @ts-ignore
    #cartView: CartView;
    #cashier: Cashier;
    #products: Array<Product>;


    //constrictor
    constructor(cashier: Cashier, cart: Cart) {
        this.#cashier = cashier;
        this.#cart = cart;
        this.#products = new Array<Product>();
        this.#cartView = new CartView(this.#cart, this);
        this.loadProducts();

        this.#cartView.notify();
    }

    /**
     * Adds a product to the cart.
     * @param product the product to be added to the cart
     * @param amount  the amount  of product to be added
     */
    async addToCart(product: Product, amount: number) {
        this.#cart.addProduct(product, amount);
        await Cart.saveCart(this.#cart, this.#cashier.getUserName());


    }

    /**
     * Load all products in store(database) to be displayed on screen for purchase
     */
    async loadProducts() {
        const smoothies = await Smoothie.getSmoothiesByType("Smoothie");
        const juices = await Juice.getJuicesByType("Juice");
        const frozenYogurts = await FrozenYogurt.getFrozenYogurtsByType("Frozen Yogurt");
        smoothies.forEach((s) => this.#products.push(s));
        juices.forEach((j) => this.#products.push(j));
        frozenYogurts.forEach((f) => this.#products.push(f));

        this.#cartView.displayProducts(this.#products);
    }

    /**
     * Removes a product from the cart.
     * @param product the product to be removed from the cart
     * @param amount the amount of product to be removed
     */
    async removeFromCart(product: Product, amount: number) {
        this.#cart.removeProduct(product, amount);
        await Cart.saveCart(this.#cart, this.#cashier.getUserName());

    }

    /**
     * Adds a coupon to the cart.
     * @param coupon coupon to be added to cart
     */
    async addCouponToCart(coupon: Coupon) {
        await this.#cart.addCoupon(coupon);
        await Cart.saveCart(this.#cart, this.#cashier.getUserName());
    }

    /**
     * Removes a coupon to the cart.
     * @param coupon coupon to be removed to cart
     */
    async removeCouponFromCart(coupon: Coupon) {
        this.#cart.removeCoupon(coupon);
        await Cart.saveCart(this.#cart, this.#cashier.getUserName());
    }

    /**
     * Adds BOGO to cart
     */
    async addBOGO() {
        await this.addCouponToCart(new BOGO("BOGO", "buy one get one free"));
    }

    /**
     * Removes BOGO from cart
     */
    async removeBOGO() {
        await this.removeCouponFromCart(new BOGO("BOGO", "buy one get one free"));
    }

    /**
     * Adds percent25 to cart
     */
    async addPercent25() {
        await this.addCouponToCart(new Percent25("PERCENT25", "25 percent off"));
    }

    /**
     * Removes percent25 from cart
     */
    async removePercent25() {
        await this.removeCouponFromCart(new Percent25("PERCENT25", "25 percent off"));
    }

    /**
     * Adds smoothie to the cart.
     * @param product smoothie to be added to cart
     */
    async addSmoothie(product: Smoothie) {
        await this.addToCart(product, 1);


    }

    /**
     * Removes Smoothie from the cart.
     * @param product smoothie to be removed to cart
     */
    async removeSmoothie(product: Smoothie) {
        await this.removeFromCart(product, 1);

    }

    /**
     * Adds juice to the cart.
     * @param product juice to be added to cart
     */
    async addJuice(product: Juice) {
        await this.addToCart(product, 1);

    }

    /**
     * Removes Juice from the cart.
     * @param product juice to be removed to cart
     */
    async removeJuice(product: Juice) {
        await this.removeFromCart(product, 1);

    }

    /**
     * Adds frozen yogurt to the cart.
     * @param product frozen yogurt to be added to cart
     * @param amount how much to be added
     */
    async addFroyo(product: FrozenYogurt, amount: number) {
        await this.addToCart(product, amount);

    }

    /**
     * Add products to cart a budget
     * @param amount the budget used to add products
     */
    async autoShop(amount: number) {
        await this.#cart.autoShop(amount, this.#cashier.getUserName());

    }

    /**
     * Removes Frozen yogurt from the cart.
     * @param product frozen yogurt to be removed from cart
     * @param amount how much to be removed
     */
    async removeFroyo(product: FrozenYogurt, amount: number) {

        await this.removeFromCart(product, amount);

    }

    /**
     * Completes the checkout process and displays the receipt.
     */
    async checkOut() {
        const receipt = await this.#cart.checkOut(this.#cashier);
        new ReceiptView(receipt, this);
    }


    /**
     * Displays the cart view so the user can continue shopping.
     */
    showCartView() {
        this.#cartView = new CartView(this.#cart, this);
        this.#cartView.displayProducts(this.#products);
        this.#cartView.notify();
    }


    getCashier(): Cashier {
        return this.#cashier;
    }
}