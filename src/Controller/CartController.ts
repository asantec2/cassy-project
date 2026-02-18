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

export default class CartController {
    #cart: Cart;
    // @ts-ignore
    #cartView: CartView;

    //constrictor
    constructor() {
        this.#cart = new Cart();
        this.#cartView = new CartView(this.#cart, this);
    }

    /**
     * Adds a product to the cart.
     * @param product the product to be added to the cart
     */
    addToCart(product: Product) {
        this.#cart.addProduct(product);

    }

    /**
     * Removes a product from the cart.
     * @param product the product to be removed from the cart
     */
    removeFromCart(product: Product) {
        this.#cart.removeProduct(product);

    }

    /**
     * Creates a Smoothie and adds it to the cart.
     */
    addSmoothie() {
        this.addToCart(new Smoothie("Strawberry Sunshine", 10));
    }

    /**
     * Creates a Smoothie and removes it from the cart.
     */
    removeSmoothie() {
        this.removeFromCart(new Smoothie("Strawberry Sunshine", 10));
    }

    /**
     * Creates a Juice and adds it to the cart.
     */
    addJuice() {
        this.addToCart(new Juice("Orange Juice", 15));
    }

    /**
     * Creates a Juice and removes it from the cart.
     */
    removeJuice() {
        this.removeFromCart(new Juice("Orange Juice", 15));
    }

    /**
     * Completes the checkout process and displays the receipt.
     */
    checkOut() {
        const receipt = this.#cart.checkOut();
        new ReceiptView(receipt, this);
    }

    /**
     * Displays the cart view so the user can continue shopping.
     */
    showCartView() {
        this.#cartView = new CartView(this.#cart, this);
    }
}