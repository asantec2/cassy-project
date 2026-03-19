/**
 * The {@code Receipt} class represents the result of a completed checkout.
 * It stores the purchased {@link Product} items and the total cost,
 * after a checkout.
 */

import  Cashier from "./Cashier.ts";
import Cart from "./Cart.ts";
import db from "./connection.ts";
import {Temporal} from "@js-temporal/polyfill";

export default class Receipt {
    #purchasedCart: Cart;
    #cashier: Cashier;
    #timeStamp: string;


    //constructor
    constructor(purchasedCart: Cart, cashier: Cashier,timeStamp?: string) {
        this.#cashier = cashier;
        this.#purchasedCart = purchasedCart;
        this.#timeStamp = timeStamp ?? Temporal.Now.plainTimeISO().toLocaleString("en-US");
    }
 getCart(){
        return this.#purchasedCart;
 }
 getCashier(){
        return   this.#cashier;
 }
 getTimeStamp(){
        return this.#timeStamp;
 }
 static async saveReceipt(receipt: Receipt): Promise<Receipt>{
   await db().query<{
       timeStamp : string
       cart  :number,
       cashier : string,

   }>("insert into receipt(timeStamp,cart_id,cashier) values ($1,$2,$3) on conflict do nothing",
       [receipt.getTimeStamp(),receipt.getCart().getCartId(),receipt.getCashier().getUserName()]);
     return receipt;
 }
    static async getReceiptForCashier(cashier:Cashier): Promise<Array<Receipt>> {
        let results = await db().query<
            {
                timeStamp: string,
                cart: number,
                cashier: string
            }
        >("select timeStamp,cart, cashier from receipt where cashier = $1",
            [cashier.getUserName()])

        let allReceipts = new Array<Receipt>();
        for(let row of results.rows){
            let cart = await Cart.getCartById(row.cart);
            let cashier = await Cashier.getCashierByUsername(row.cashier);
            let receipt = new Receipt(cart,cashier,row.timeStamp);
            allReceipts.push(receipt);
        }

        return allReceipts;
    }

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

        return new Receipt(cart, cashier, row.timestamp);
    }
}