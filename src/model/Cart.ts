/**
 * The {@code Cart} class represents the logic of a shopping cart.
 * It manages a collection of {@link Product} objects, registered {@link Listener}s,
 * and supports checkout through the creation of a {@link Receipt}.
 */
import Product from "./Product.ts";
import Receipt from "./Receipt.ts";
import type Listener from "./Listener.ts";
import db from './connection.ts'
import type Coupon from "./Coupon.ts";
import {assert} from "../assertions.ts";
import  Cashier from "./Cashier.ts";
import BOGO from "./BOGO.ts";
import Percent25 from "./Percent25.ts";


export default class Cart {
    #items: Array<Product>
    #listeners: Array<Listener>;
    #coupons: Array<Coupon>;
    #quantities: Array<number>;
    #total: number;
    cart_id?:number;

    //constructor
    constructor(cartId?: number) {
        this.#items = new Array<Product>();
        this.#listeners = new Array<Listener>();
        this.#coupons = new Array<Coupon>();
        this.#quantities =new Array<number>();
        this.#total = 0;
        this.cart_id = cartId;
        this.#checkCart();
    }
    #checkCart() {
        assert(this.#total >= 0, "total must be greater than 0");
    }
    /**
     * Add product to a list of products in the cart
     * @param product the product to be added to the cart
     * @param amount
     */
    addProduct(product: Product, amount:number) {

        if (product.getQuantity() < amount) {
            throw new InvalidProductAdditionException();
        }
        let index = -1;

        for (let i = 0; i < this.#items.length; i++) {
            if (this.#items[i].getName() === product.getName()) {
                index = i;
            }
        }
        if (index === -1) {
            this.#items.push(product);
            this.#quantities.push(amount);
        } else {
            this.#quantities[index] = this.#quantities[index] + amount;
        }
        this.#notifyAll();
    }

    getCoupons(){
        return this.#coupons;
    }
    loadProduct(product:Product){
        this.#items.push(product);
    }
    loadCoupon(coupon:Coupon){
        this.#coupons.push(coupon);
    }

    getCartId(){
        return this.cart_id;
    }
    setCartId(cartId : number){
        this.cart_id = cartId;
    }
    setTotal(newTotal:number){
        this.#total = newTotal;
    }
    static async saveCart(cart:Cart) :Promise<Cart>{
        const result = await db().query<{
            cart_id:number

        }>("insert  into cart(total) values ($1) returning cart_id",[cart.getTotal()]);

        const cartId = result.rows[0].cart_id;
        cart.setCartId(cartId);
        for (let i = 0 ;i < cart.getItems().length; i++) {
            let product = cart.getItems()[i];
            let quantity = cart.getQuantities()[i];
            await db().query(
                "insert into cartItem(product_name, cart_id, quantity, current_total) values($1, $2, $3, $4)",
                [
                    product.getName(),
                    cartId,
                    quantity,
                    cart.getTotal()
                ]
            );
        }

        for (let coupon of cart.getCoupons()) {
            await db().query(
                "insert into cartCoupon(coupon, cart_id) values($1, $2)",
                [
                    coupon.getName(),
                    cartId
                ]
            );
        }

        return cart;

    }
    getQuantities(){
        return this.#quantities;
    }

    removeCoupon(coupon: Coupon): void {
        let index = -1;

        for (let i = 0; i < this.#coupons.length; i++) {
            if (index === -1) {
                if (this.#coupons[i].getName() === coupon.getName()) {
                    index = i;
                }
            }
        }

        if (index !== -1) {
            this.#coupons.splice(index, 1);
        }else{
            throw new InvalidCouponRemovalException();
        }
        this.#notifyAll();
    }
    static async getCartById(cart_id: number): Promise<Cart> {
        const result = await db().query<{
            cart_id: number;
            total: number;
        }>(
            "select cart_id, total from cart where cart_id = $1",
            [cart_id]
        );


        const row = result.rows[0];
        const cart = new Cart(row.cart_id);
        cart.setTotal(row.total);

        const products = await Cart.getItemsForCart(cart_id);
        for (let product of products) {
            cart.loadProduct(product);
        }

        const coupons = await Cart.getCouponsForCart(cart_id);
        for (let coupon of coupons) {
            cart.loadCoupon(coupon);
        }

        return cart;
    }
    static async getItemsForCart(cart_id: number): Promise<Array<Product>>{
        const items = new Array<Product>();
        const itemResults = await db().query<{
            product_name: string,
            cart_id :number,
            quantity: number,
            current_total: number;

        }>(
            `select product_name,cart_id, quantity, current_total  from cartItem
             where cart_id = $1`,
            [cart_id]
        );

        for (let itemRow of itemResults.rows) {
            for (let i = 0; i < itemRow.quantity; i++) {
                let product = await Product.getProductByName(itemRow.product_name);
                items.push(product);
            }
        }
        return items;
    }
    static async getCouponsForCart(cart_id: number):Promise<Array<Coupon>>{
        const coupons = new Array<Coupon>();
        const couponResults = await db().query<{
            coupon: string;
            cart_id: number;
        }>(
            `select coupon, cart_id from cartCoupon where cart_id = $1`,
            [cart_id]
        );

        for (let couponRow of couponResults.rows) {
            let couponName = couponRow.coupon;
            let coupon: any;

            if (couponName === "BOGO") {
                coupon = await BOGO.getCouponByName(couponName);
            } else if (couponName === "PERCENT25") {
                coupon = await Percent25.getCouponByName(couponName);
            }
            coupons.push(coupon);
        }
        return coupons;
    }

    /**
     * Notify all listeners after there is a change in the Cart
     */
    #notifyAll() {
        this.#listeners.forEach((l) => l.notify());
    }

    /**
     * Remove product to a list of products in the cart if it has been added
     * @param product the product to be removed from the cart
     * @param amount
     */
    removeProduct(product: Product,amount:number): void {
        let index = -1;
        for (let i = 0; i < this.#items.length; i++) {
            if (index === -1) {
                if (this.#items[i].getName() === product.getName()) {
                    index = i;
                }
            }
        }

        if (index === -1|| this.#quantities[index] < amount) {
            throw new InvalidProductRemovalException();

        }
        this.#quantities[index] = this.#quantities[index] - amount;
        product.increaseQuantity(amount);

        if (this.#quantities[index] === 0) {
            this.#items.splice(index, 1);
            this.#quantities.splice(index, 1);
        }

        this.#notifyAll();
    }

    getQuantityForProduct(productName: string): number {
        for (let i = 0; i < this.#items.length; i++) {
            if (this.#items[i].getName() === productName) {
                return this.#quantities[i];
            }
        }
        return 0;
    }

    /**
     * Get total price of products in the cart
     * @return number - the total price of the products in the cart
     */
    getTotal(): number {
        for (let i = 0; i < this.#items.length; i++) {
            this.#total = this.#total + this.#items[i].getPrice();
        }
        return this.#total;
    }

    getItems() {
        return this.#items;
    }

    /**
     * Check out - purchase all items in cart if the items exist
     * @return Receipt - the receipt generated after purchasing the items in the cart
     */
    checkOut(cashier: Cashier): Receipt {

        if(this.#items.length === 0){
            throw new InvalidCartCheckoutException();
        }

        for(let i = 0;i< this.#coupons.length ;i++){
            this.#coupons[i].applyCoupon(this);
        }
        this.#coupons = new Array<Coupon>();
        let receipt = new Receipt(this,cashier);
        this.#items = new Array<Product>();
        this.#notifyAll();
        return receipt;
    }

     /**
     * Register a listener by adding it to the list of listeners.
     * @param listener the listener to be registered
     */
    registerListener(listener: Listener) {
        this.#listeners.push(listener);
    }

    addCoupon(coupon:Coupon){
        for (let i = 0; i < this.#coupons.length; i++) {
            if (this.#coupons[i].getName() === coupon.getName()) {
                throw new InvalidCouponAdditionException();
            }
        }
        this.#coupons.push(coupon);
        this.#notifyAll();
    }

}
export class InvalidProductAdditionException extends Error { }
export class InvalidProductRemovalException extends Error { }
export class InvalidCartCheckoutException extends Error { }
export class InvalidCouponAdditionException extends Error{}
export class InvalidCouponRemovalException extends Error{}