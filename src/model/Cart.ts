import Product from "./Product.ts";
import Receipt from "./Receipt.ts";
import type Listener from "./Listener.ts";

export default class Cart {
    #items: Array<Product>
    #listeners: Array<Listener>;

    constructor() {
        this.#items = new Array<Product>();
        this.#listeners = new Array<Listener>();
    }

    addProduct(product: Product) {
        if(product.getQuantity() > 0){
            this.#items.push(product);
            product.reduceQuantity();
        }else{
          throw new InvalidProductAdditionException();
        }

        this.#notifyAll();

    }

    #notifyAll() {
        this.#listeners.forEach((l) => l.notify());
    }

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

    registerListener(listener: Listener) {
        this.#listeners.push(listener);
    }
}
export class InvalidProductAdditionException extends Error { }
export class InvalidProductRemovalException extends Error { }
export class InvalidCartCheckoutException extends Error { }