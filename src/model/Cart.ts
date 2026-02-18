/**
 * The {@code Cart} class represents the logic of a shopping cart.
 * It manages a collection of {@link Product} objects, registered {@link Listener}s,
 * and supports checkout through the creation of a {@link Receipt}.
 */
import Product from "./Product.ts";
import Receipt from "./Receipt.ts";
import type Listener from "./Listener.ts";

export default class Cart {
    #items: Array<Product>
    #listeners: Array<Listener>;

    //constructor
    constructor() {
        this.#items = new Array<Product>();
        this.#listeners = new Array<Listener>();
    }

    /**
    * Add product to a list of products in the cart
    * @param product the product to be added to the cart
    */
    addProduct(product: Product) {
        if(product.getQuantity() > 0){
            this.#items.push(product);
            product.reduceQuantity();
        }else{
          throw new InvalidProductAdditionException();
        }

        this.#notifyAll();

    }

    /**
     * Notify all listeners after there is a change in the Cart
     */
    #notifyAll() {
        this.#listeners.forEach((l) => l.notify());
    }

    /**
     * Remove product to a list of products in the cart if it has been added
     * @param product the product to be removed from the cart
     */
    removeProduct(product: Product): void {
        let index = -1;

        for (let i = 0; i < this.#items.length; i++) {
            if (index === -1) {
                if (this.#items[i].getName() === product.getName()) {
                    index = i;
                }
            }
        }

        if (index !== -1) {
            this.#items.splice(index, 1);
            product.increaseQuantity();
        }else{
            throw new InvalidProductRemovalException();
        }

        this.#notifyAll();
    }


    /**
     * Get total price of products in the cart
     * @return number - the total price of the products in the cart
     */
    getTotal(): number {
        let total = 0;

        for (let i = 0; i < this.#items.length; i++) {
            total = total + this.#items[i].getPrice();
        }
        return total;
    }

    getItems() {
        return this.#items;
    }

    /**
     * Check out - purchase all items in cart if the items exist
     * @return Receipt - the receipt generated after purchasing the items in the cart
     */
    checkOut(): Receipt {

        if(this.#items.length === 0){
            throw new InvalidCartCheckoutException();
        }
        let total = this.getTotal();
        let purchasedItems = new Array<Product>();
        for (let i = 0; i < this.#items.length; i++) {
            purchasedItems.push(this.#items[i]);
        }

        let receipt = new Receipt(total, purchasedItems);
        this.#items = new Array<Product>();
        this.#notifyAll();
        return receipt;
    }

     /**
     * Register a listener by adding it to the list of listeners.
     * @param listener the listener to be registered
     */
    registerListener(listener: Listener) {
        this.#listeners.push(listener);
    }
}
export class InvalidProductAdditionException extends Error { }
export class InvalidProductRemovalException extends Error { }
export class InvalidCartCheckoutException extends Error { }