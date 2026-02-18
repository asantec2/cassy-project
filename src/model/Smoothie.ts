/**
 * The {@code Smoothie} class represents a smoothie
 * product available for purchase which is one of the two types of product.
 */
import Product from "./Product.ts";
import {assert} from "vitest";

export default class Smoothie extends Product {
    //quantity of smoothie in stock
    static #stock = 10;

    //constructor
    constructor(name: string, price: number) {
        super(name, price);
        this.#checkSmoothie();
    }

    //implementation of class invariants
    #checkSmoothie(){
        assert(Smoothie.#stock >= 0,"stock should be greater than or equal to 0");
    }
    getQuantity(): number {
        return Smoothie.#stock;
    }

    /**
     * Reduces the quantity of stock of Smoothie by one
     */
    reduceQuantity(): void {
        Smoothie.#stock--;
        this.#checkSmoothie()
    }

    /**
     * Increases the quantity of stock of Smoothie by one
     */
    increaseQuantity(): void {
        Smoothie.#stock++;
        this.#checkSmoothie();
    }
}