/**
 * The {@code Smoothie} class represents a smoothie
 * product available for purchase which is one of the two types of product.
 */
import Product from "./Product.ts";
export default class Smoothie extends Product {
    //quantity of smoothie in stock


    //constructor
    constructor(name: string, price: number,quantity :number) {
        super(name, price,quantity);

    }

}