/**
 * The {@code BOGO} class represents a "Buy One Get One Free" coupon applied to a {@link Cart}.
 * It applies a discount based on eligible items in the cart, reducing the total cost
 * when multiple qualifying products are present.
 */


import type Coupon from "./Coupon.ts";
import type Cart from "./Cart.ts";
import {assert} from "../assertions.ts";
import db from "./connection.ts";

export default class BOGO implements Coupon {
    #name: string;
    #description: string;

    //constructor
    constructor(name: string, description: string) {
        this.#description = description;
        this.#name = name;
        this.#checkBOGO();
    }

    //implementation of class invariants
    #checkBOGO() {
        assert(this.#name.length >= 1, "name must contain at least one character");
        assert(this.#description.length >= 1, "description must contain at least one character");
    }

    getName() {
        return this.#name;
    }

    getDescription() {
        return this.#description;
    }

    /**
     * Save coupon by inserting it into database
     * @param coupon the coupon to be saved into database
     */
    static async saveCoupon(coupon: BOGO): Promise<BOGO> {
        await db().query<{
            name: string,
            description: string
        }>("insert into coupon(name,description) values ($1,$2) on conflict do nothing returning name",
            [coupon.getName(), coupon.getDescription()]);
        return coupon;
    }

    /**
     * Gets coupon from database based on name
     * @param name the name we want to get coupon based on
     */
    static async getCouponByName(name: string): Promise<BOGO> {
        const result = await db().query<
            {
                name: string,
                description: string
            }
        >(
            "select name, description from coupon where name = $1",
            [name]
        );

        const row = result.rows[0];
        return new BOGO(row.name, row.description);
    }


    /**
     * Apply BOGO coupon to cart by reducing price based on number of pairs
     * @param cart the cart for coupon to be applied to
     */
    applyCoupon(cart: Cart): void {
        let smoothie = 0;
        let juice = 0;
        let froyo = 0;

        let smoothiePrice = 0;
        let juicePrice = 0;
        let froyoPrice = 0;

        const items = cart.getItems();
        const quantities = cart.getQuantities();

        for (let i = 0; i < items.length; i++) {
            if (items[i].getName() === "Strawberry Sunshine") {
                smoothie += quantities[i];
                smoothiePrice = items[i].getPrice();
            } else if (items[i].getName() === "Orange Juice") {
                juice += quantities[i];
                juicePrice = items[i].getPrice();
            } else if (items[i].getName() === "Vanilla Froyo") {
                froyo += quantities[i];
                froyoPrice = items[i].getPrice();
            }
        }

        const freeSmoothie = Math.floor(smoothie / 2);
        const freeJuice = Math.floor(juice / 2);
        const freeFroyo = Math.floor(froyo / 2);

        if (freeSmoothie === 0 && freeJuice === 0 && freeFroyo === 0) {
            throw new InvalidBOGOApplicationException();
        }

        const discount =
            freeSmoothie * smoothiePrice +
            freeJuice * juicePrice +
            freeFroyo * froyoPrice;

        cart.setTotal(cart.getTotal() - discount);
    }
}

export class InvalidBOGOApplicationException extends Error {
}