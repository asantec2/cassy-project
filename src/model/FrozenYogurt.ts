import Product from "./Product.ts";


export default class FrozenYogurt extends Product {


    //constructor
    constructor(name: string, price: number, quantity:number) {
        super(name, price,quantity);

    }
}