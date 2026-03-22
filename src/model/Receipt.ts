/**
 * The {@code Receipt} class represents the result of a completed checkout.
 * It stores the purchased {@link Cart} items with associated properties,
 * associated cashier and the timeStamp, after a checkout.
 */

import Cashier from "./Cashier.ts";
import Cart from "./Cart.ts";
import db from "./connection.ts";
import {Temporal} from "@js-temporal/polyfill";

export default class Receipt {
    #purchasedCart: Cart;
    #cashier: Cashier;
    #timeStamp: string;


    //constructor
    constructor(purchasedCart: Cart, cashier: Cashier, timeStamp?: string) {
        this.#cashier = cashier;
        this.#purchasedCart = purchasedCart;
        this.#timeStamp = timeStamp ?? Temporal.Now.plainDateTimeISO().toString();
    }

    getCart() {
        return this.#purchasedCart;
    }

    getCashier() {
        return this.#cashier;
    }

    getTimeStamp() {
        return this.#timeStamp;
    }

    /**
     * Save receipt by inserting it into database
     * @param receipt the receipt to be saved into database
     */
    static async saveReceipt(receipt: Receipt): Promise<Receipt> {
        await db().query<{
            timeStamp: string
            cart: number,
            cashier: string,

        }>("insert into receipt(timeStamp,cart,cashier) values ($1,$2,$3) on conflict do nothing",
            [receipt.getTimeStamp(), receipt.getCart().getCartId(), receipt.getCashier().getUserName()]);
        return receipt;
    }

    /**
     * Gets receipt from database based on cashier
     * @param cashier the cashier we want to get receipt based on
     */
    static async getReceiptForCashier(cashier: Cashier): Promise<Array<Receipt>> {
        let results = await db().query<
            {
                timeStamp: string,
                cart: number,
                cashier: string
            }
        >("select timeStamp,cart, cashier from receipt where cashier = $1",
            [cashier.getUserName()])

        let allReceipts = new Array<Receipt>();
        for (let row of results.rows) {
            let cart = await Cart.getCartById(row.cart);
            let cashier = await Cashier.getCashierByUsername(row.cashier);
            // @ts-ignore
            let receipt = new Receipt(cart, cashier, row.timeStamp);
            allReceipts.push(receipt);
        }

        return allReceipts;
    }

    /**
     * Gets receipt from database based on cartId
     * @param cartId the cartId we want to get receipt based on
     */
    static async getReceiptByCartId(cartId: number): Promise<Receipt> {
        let results = await db().query<{
            timestamp: string;
            cart: number;
            cashier: string;
        }>(
            "select timeStamp, cart, cashier from receipt where cart = $1",
            [cartId]
        );


        let row = results.rows[0];
        let cart = await Cart.getCartById(row.cart);
        let cashier = await Cashier.getCashierByUsername(row.cashier);

        // @ts-ignore
        return new Receipt(cart, cashier, row.timestamp);
    }
}