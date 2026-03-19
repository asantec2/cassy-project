/**
 * The {@code Juice} class represents a juice
 * product available for purchase which is one of the two types of product.
 */
import Product from "./Product.ts";


export default class Juice extends Product {


    //constructor
    constructor(name: string, price: number, quantity:number) {
        super(name, price,quantity);

    }
}