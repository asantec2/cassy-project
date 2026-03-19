/**
 * The {@code Product} class represents an abstract purchasable item.
 * It stores a product’s name and price,and defines abstract stock-management methods for subclasses.
 */
import {assert} from "../assertions.ts";
import db from "./connection.ts";
import Juice from "./Juice.ts";
import Smoothie from "./Smoothie.ts";
import FrozenYogurt from "./FrozenYogurt.ts";

export default abstract class Product {
    #name: string;
    #price: number;
    #quantity: number;

    //constructor
    constructor(name: string, price: number,quantity :number) {
        this.#name = name;
        this.#price = price;
        this.#quantity = quantity;
        this.#checkProduct();
    }

    //implementation of class invariants
    #checkProduct() {
        assert(this.#name.length >= 1, "name must contain at least one character");
        assert(this.#price >= 0, "price must be greater than or equal to 0");
        assert(this.#quantity >= 0, "quantity must be greater than or equal to 0");
    }

    static async saveProduct(product : Product):Promise<Product>{
        await db().query<{
            quantity: number
            name : string;
            price: number,

        }>("insert into product(quantity,name,price) values($1,$2,$3) on conflict do nothing returning name",
            [
                product.getQuantity(),
                product.getName(),
                product.getPrice()

            ]);
        return product;
    }
    static async getAllProducts(): Promise<Array<Product>> {
        const allProducts = new Array<Product>();

        let results = await db()
            .query<{ name: string, price: number, quantity: number }>(
                "select name, price, quantity from product"
            );

        for (let row of results.rows) {

            if (row.name === "Strawberry Sunshine") {
                allProducts.push(new Smoothie(row.name, row.price, row.quantity));
            } else if (row.name === "Orange Juice") {
                allProducts.push( new Juice(row.name, row.price, row.quantity));
            } else if (row.name === "Vanilla Froyo") {
                allProducts.push(new FrozenYogurt(row.name, row.price, row.quantity));
            }
        }

        return allProducts;
    }
    static async getProductByName(name: string):Promise<Product>{
        const result = await db().query<
            {
                quantity: number
                name: string,
                price: number,

            }
        >(
            "select quantity,name, price  from product where name = $1",
            [name]
        );

        const row = result.rows[0];
        let product : any;
        if (row.name === "Strawberry Sunshine") {
            product =  new Smoothie(row.name, row.price, row.quantity);
        } else if (row.name === "Orange Juice") {
            product = new Juice(row.name, row.price, row.quantity);
        } else if (row.name === "Vanilla Froyo") {
            product = new FrozenYogurt(row.name, row.price, row.quantity);
        }
        return product;
    }
    getPrice(): number {
        return this.#price;
    }

    getName(): string {
        return this.#name;
    }
    setPrice(newPrice: number){
        this.#price = newPrice;
   }

    getQuantity(): number {
        return this.#quantity;
    }

    /**
     * Reduces the quantity of Product
     */
    reduceQuantity(quantity:number): void {
        this.#quantity = this.#quantity - quantity;
        this.#checkProduct();
    }

    /**
     * Increases the quantity of stock of Product by one
     */
    increaseQuantity(quantity:number): void {
        this.#quantity  = this.#quantity + quantity;
        this.#checkProduct();
    }


}