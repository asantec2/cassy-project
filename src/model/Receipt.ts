import {assert} from "../assertions.ts";
import Product from "./Product.ts";


export default class Receipt {
    #items: Array<Product>;
    #total: number;

    constructor(total: number, items: Array<Product>) {
        this.#total = total;
        this.#items = items;
        this.#checkReceipt();
    }

    #checkReceipt() {
        assert(this.#total > 0, "total must be greater than 0");
        assert(this.#items.length >= 1, "items should have at least one product");
    }

    getTotal(): number {
        return this.#total;
    }

    getItems() {
        return this.#items;
    }
}