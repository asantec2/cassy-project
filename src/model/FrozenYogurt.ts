/**
 * The {@code FrozenYogurt} class represents a frozen yogurt
 * product available for purchase which is one of the three types of product.
 */

import Product from "./Product.ts";
import db from "./connection.ts";


export default class FrozenYogurt extends Product {


    //constructor
    constructor(name: string, price: number, quantity: number) {
        super(name, price, quantity);

    }


    /**
     * Gets all frozen yogurts in database based on type
     * @param type the type of product we want to get product by
     */
    static async getFrozenYogurtsByType(type: string): Promise<Array<FrozenYogurt>> {
        const result = await db().query<{
            quantity: number;
            name: string;
            price: number;
        }>(
            "select quantity, name, price from product where product_type = $1",
            [type]
        );

        const allFrozenYogurt = new Array<FrozenYogurt>();
        for (let row of result.rows) {
            allFrozenYogurt.push(new FrozenYogurt(row.name, row.price, row.quantity));
        }


        return allFrozenYogurt;
    }

    /**
     * Get FrozenYogurt from database based on the name
     * @param name the name of frozen yogurt we want to get from database
     */
    static async getFroyoByName(name: string): Promise<FrozenYogurt> {
        const result = await db().query<{
            quantity: number;
            name: string;
            price: number;
        }>(
            "select quantity, name, price from product where name = $1",
            [name]
        );

        const row = result.rows[0];
        return new FrozenYogurt(row.name, row.price, row.quantity);
    }

}