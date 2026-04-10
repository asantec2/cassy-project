/**
 * The {@code Cart} class represents the logic of a shopping cart.
 * It manages a collection of {@link Product} objects,{@link Coupon}object,and registered {@link Listener}s,
 * and supports checkout through the creation of a {@link Receipt}.
 */
import Product from "./Product.ts";
import Receipt from "./Receipt.ts";
import type Listener from "./Listener.ts";
import db from './connection.ts'
import type Coupon from "./Coupon.ts";
import {assert} from "../assertions.ts";
import Cashier from "./Cashier.ts";
import BOGO from "./BOGO.ts";
import Percent25 from "./Percent25.ts";
import Smoothie from "./Smoothie.ts";
import Juice from "./Juice.ts";
import FrozenYogurt from "./FrozenYogurt.ts";
import {getNextState} from "./MarkovModel.ts";


export default class Cart {
    #items: Array<Product>
    #listeners: Array<Listener>;
    #coupons: Array<Coupon>;
    #quantities: Array<number>;
    #total: number;
    cart_id?: number;
    currentProduct: string | null;

    //constructor
    constructor(cartId?: number) {
        this.#items = new Array<Product>();
        this.#listeners = new Array<Listener>();
        this.#coupons = new Array<Coupon>();
        this.#quantities = new Array<number>();
        this.#total = 0;
        this.cart_id = cartId;
        this.currentProduct = null;
        this.#checkCart();
    }

    //implementation of class invariants
    #checkCart() {
        assert(this.#total >= 0, "total must be greater than 0");
    }

    /**
     * Add product to a list of products in the cart
     * @param product the product to be added to the cart
     * @param amount the number of the product to be added
     */
    addProduct(product: Product, amount: number) {
        let index = -1;

        for (let i = 0; i < this.#items.length; i++) {
            if (this.#items[i].getName() === product.getName()) {
                index = i;
            }
        }

        let currentInCart = 0;

        if (index !== -1) {
            currentInCart = this.#quantities[index];
        }

        if (amount <= 0) {
            throw new InvalidAdditionAmount();
        }
        if (product.getQuantity() < currentInCart + amount) {
            throw new InvalidProductAdditionException();
        }

        if (index === -1) {
            this.#items.push(product);
            this.#quantities.push(amount);
        } else {
            this.#items[index] = product;
            this.#quantities[index] = this.#quantities[index] + amount;
        }


        this.calculateTotal();
        this.currentProduct = product.getName();
        this.#notifyAll();
    }


    getCoupons() {
        return this.#coupons;
    }

    /**
     * load products back into cart
     * @param product the product to be added back
     * @param quantity the quantity of product to be added
     */
    loadProduct(product: Product, quantity: number) {
        this.#items.push(product);
        this.#quantities.push(quantity);
    }

    /**
     * load coupon back into cart
     * @param coupon the coupon to be added back
     */
    loadCoupon(coupon: Coupon) {
        this.#coupons.push(coupon);
    }

    getCartId() {
        return this.cart_id;
    }

    setCartId(cartId: number) {
        this.cart_id = cartId;
    }

    setTotal(newTotal: number) {
        this.#total = newTotal;
    }

    /**
     * Add products to cart based on budget and model from training data
     * @param budget the budget for addition of products
     * @param name of the cashier for cart
     */
    async autoShop(budget: number, name: string) {

        if (budget <= 0) {
            throw new InvalidBudgetException();
        }
        if (this.currentProduct === null) {
            throw new InvalidAutoShopCartException();
        }
        let remainingBudget = budget;
        let currentProductName = this.currentProduct;
        while (remainingBudget > 0) {
            const nextProductName = await getNextState(currentProductName);
            const nextProduct = await this.getProductByName(nextProductName);

            const fixedAmount = 1;
            const cost = nextProduct.getPrice() * fixedAmount;

            if (cost > remainingBudget) {
                throw new LowBudgetException();
            }

            this.addProduct(nextProduct, fixedAmount);
            await Cart.saveCart(this, name);
            remainingBudget = remainingBudget - cost;
            currentProductName = nextProductName;
        }


    }
    getProductType(product:Product){
        let type = "";

        if (product instanceof Smoothie) {
            type = "Smoothie";
        } else if (product instanceof Juice) {
            type = "Juice";
        } else if (product instanceof FrozenYogurt) {
            type = "Frozen Yogurt";
        }
      return type;

    }
    /**
     * Load all products in store(database) to be displayed on screen for purchase
     */
    static async loadProducts():Promise<Array<Product>> {
        let products = new Array<Product>();
        const smoothies = await Smoothie.getSmoothiesByType("Smoothie");
        const juices = await Juice.getJuicesByType("Juice");
        const frozenYogurts = await FrozenYogurt.getFrozenYogurtsByType("Frozen Yogurt");
        smoothies.forEach((s) => products.push(s));
        juices.forEach((j) => products.push(j));
        frozenYogurts.forEach((f) => products.push(f));
        return products;

        //this.#cartView.displayProducts(this.#products);
    }

    /**
     * Get product from database based on the name of the product
     * @param name the name to get product based on
     */
    async getProductByName(name: string): Promise<Product> {
        const productType = await Product.getProductTypeByName(name);
        let product: any;

        if (productType === "Smoothie") {
            product = await Smoothie.getSmoothieByName(name);
        } else if (productType === "Juice") {
            product = await Juice.getJuiceByName(name);

        } else {
            product = await FrozenYogurt.getFroyoByName(name);
        }
        return product;
    }

    getCurrentProduct() {
        return this.currentProduct;
    }

    /**
     * Save cart by inserting it into database
     * @param cart cart to be saved
     * @param username username  of cashier associated cart to be saved into database
     */
    static async saveCart(cart: Cart, username: string): Promise<Cart> {
        cart.calculateTotal();

        let cartId = cart.getCartId();
        let currentProduct = cart.getCurrentProduct();


        if (cartId === undefined) {
            const result = await db().query<{ cart_id: number }>(
                "insert into cart(total,cashier,current_product) values ($1,$2,$3) returning cart_id",
                [cart.getTotal(), username, currentProduct]
            );

            cartId = result.rows[0].cart_id;
            cart.setCartId(cartId);
        } else {
            await db().query(
                "update cart set total = $1,current_product = $2 where cart_id = $3",
                [cart.getTotal(), currentProduct, cartId]
            );

            await db().query(
                "delete from cartItem where cart_id = $1",
                [cartId]
            );

            await db().query(
                "delete from cartCoupon where cart_id = $1",
                [cartId]
            );
        }

        for (let i = 0; i < cart.getItems().length; i++) {
            const product = cart.getItems()[i];
            const quantity = cart.getQuantities()[i];
            const rowTotal = product.getPrice() * quantity;

            await db().query(
                `insert into cartItem(product_name, cart_id, quantity, current_total)
                 values ($1, $2, $3, $4)`,
                [product.getName(), cartId, quantity, rowTotal]
            );
        }

        for (let i = 0; i < cart.getCoupons().length; i++) {
            const coupon = cart.getCoupons()[i];

            await db().query(
                "insert into cartCoupon(coupon, cart_id) values($1, $2)",
                [coupon.getName(), cartId]
            );
        }

        return cart;
    }

    getQuantities() {
        return this.#quantities;
    }

    /**
     * Remove coupon from a list of coupons in the cart if it has been added
     * @param coupon the coupon to be removed from the cart
     */
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
        } else {
            throw new InvalidCouponRemovalException();
        }
        this.#notifyAll();
    }

    /**
     * Gets cart from database based on cart_id
     * @param cart_id the cart_id we want to get cart based on
     */
    static async getCartById(cart_id: number): Promise<Cart> {
        const result = await db().query<{
            cart_id: number;
            total: number;
            current_product: string;
        }>(
            "select cart_id, total,current_product from cart where cart_id = $1",
            [cart_id]
        );


        const row = result.rows[0];
        const cart = new Cart(row.cart_id);
        cart.setTotal(row.total);
        cart.setCurrentProduct(row.current_product);

        const products = await Cart.getItemsForCart(cart_id);
        for (let i = 0; i < products.length; i++) {
            cart.loadProduct(products[i].product, products[i].quantity);
        }


        const coupons = await Cart.getCouponsForCart(cart_id);
        for (let coupon of coupons) {
            cart.loadCoupon(coupon);
        }

        return cart;
    }

    setCurrentProduct(name: string | null) {
        this.currentProduct = name;
    }

    /**
     * Gets product from database based on name of product
     * @param name the name we want to get product based on
     */
    static async getProductByName(name: string): Promise<Product> {
        const productResults = await db().query<{
            name: string;
            product_type: string;
            quantity: number;
            price: number;
        }>(
            `select name, product_type, quantity, price
             from product
             where name = $1`,
            [name]
        );


        const productRow = productResults.rows[0];

        if (productRow.product_type === "Smoothie") {
            return new Smoothie(productRow.name, productRow.price, productRow.quantity);
        } else if (productRow.product_type === "Juice") {
            return new Juice(productRow.name, productRow.price, productRow.quantity);
        } else {
            return new FrozenYogurt(productRow.name, productRow.price, productRow.quantity);
        }
    }

    /**
     * Gets items from database based on cart_id
     * @param cart_id the cart_id we want to get items based on
     */
    static async getItemsForCart(cart_id: number): Promise<Array<{ product: Product; quantity: number }>> {
        const items = new Array<{ product: Product; quantity: number }>();

        const itemResults = await db().query<{
            product_name: string;
            cart_id: number;
            quantity: number;
            current_total: number;
        }>(
            `select product_name, cart_id, quantity, current_total
             from cartItem
             where cart_id = $1`,
            [cart_id]
        );

        for (let i = 0; i < itemResults.rows.length; i++) {
            const itemRow = itemResults.rows[i];
            const product = await Cart.getProductByName(itemRow.product_name);

            items.push({
                product: product,
                quantity: itemRow.quantity
            });
        }


        return items;
    }

    /**
     * Gets cart from database based on cashier username
     * @param username the username we want to get cart based on
     */
    static async getCartByCashier(username: string): Promise<Cart | null> {
        const result = await db().query<{
            cart_id: number;
        }>(
            "select cart_id from cart where cashier = $1",
            [username]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return await Cart.getCartById(result.rows[0].cart_id);
    }

    /**
     * Gets coupons from database based on cart_id
     * @param cart_id the cart_id we want to get coupon based on
     */
    static async getCouponsForCart(cart_id: number): Promise<Array<Coupon>> {
        const coupons = new Array<Coupon>();
        const couponResults = await db().query<{
            coupon: string;
            cart_id: number;
        }>(
            `select coupon, cart_id
             from cartCoupon
             where cart_id = $1`,
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
     * @param amount the quantity of product to be removed
     */
    removeProduct(product: Product, amount: number): void {
        let index = -1;

        for (let i = 0; i < this.#items.length; i++) {
            if (index === -1) {
                if (this.#items[i].getName() === product.getName()) {
                    index = i;
                }
            }
        }

        if (amount <= 0) {
            throw new InvalidRemovalAmount();
        }
        if (index === -1 || this.#quantities[index] < amount) {
            throw new InvalidProductRemovalException();
        }

        this.#items[index] = product;
        this.#quantities[index] = this.#quantities[index] - amount;

        if (this.#quantities[index] === 0) {
            this.#items.splice(index, 1);
            this.#quantities.splice(index, 1);
        }

        this.calculateTotal();
        this.#notifyAll();
    }


    getTotal(): number {
        return this.#total;
    }

    /**
     * calculate total price of products in the cart
     * @return number - the total price of the products in the cart
     */
    calculateTotal() {
        let total = 0;

        for (let i = 0; i < this.#items.length; i++) {
            total = total + (this.#items[i].getPrice() * this.#quantities[i]);
        }

        this.#total = total;
    }

    getItems() {
        return this.#items;
    }

    /**
     * Check out - purchase all items in cart if the items exist
     * @return Receipt - the receipt generated after purchasing the items in the cart
     */
    async checkOut(cashier: Cashier): Promise<Receipt> {
        if (this.#items.length === 0) {
            throw new InvalidCartCheckoutException();
        }

        for (let i = 0; i < this.#items.length; i++) {
            const latestProduct = this.#items[i];
            const quantityWanted = this.#quantities[i];

            if (latestProduct.getQuantity() < quantityWanted) {
                throw new OutOfStockException();
            }
        }

        this.calculateTotal();

        for (let i = 0; i < this.#coupons.length; i++) {
            this.#coupons[i].applyCoupon(this);
        }

        const purchasedCart = this.copyCart();
        const receipt = new Receipt(purchasedCart, cashier);

        cashier.addReceipt(receipt);

        for (let i = 0; i < this.#items.length; i++) {
            const product = this.#items[i];
            const quantityBought = this.#quantities[i];

            product.reduceQuantity(quantityBought);

            if (product instanceof Smoothie) {
                await Smoothie.saveProduct(product);
            } else if (product instanceof Juice) {
                await Juice.saveProduct(product);
            } else if (product instanceof FrozenYogurt) {
                await FrozenYogurt.saveProduct(product);
            }
        }

        await Receipt.saveReceipt(receipt);

        this.#coupons = new Array<Coupon>();
        this.#items = new Array<Product>();
        this.#quantities = new Array<number>();
        this.setTotal(0);
        this.setCurrentProduct(null);

        await Cart.saveCart(this, cashier.getUserName());

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

    /**
     * Make a deep copy of the current cart
     * @return Cart the deep copy of the cart
     */
    copyCart(): Cart {
        const copiedCart = new Cart(this.getCartId());

        copiedCart.setTotal(this.getTotal());

        for (let i = 0; i < this.#items.length; i++) {
            copiedCart.#items.push(this.#items[i]);
            copiedCart.#quantities.push(this.#quantities[i]);
        }

        for (let i = 0; i < this.#coupons.length; i++) {
            copiedCart.#coupons.push(this.#coupons[i]);
        }

        return copiedCart;
    }


    /**
     * Adds coupon to cart
     * @param coupon to be added to cart
     */
    async addCoupon(coupon: any) {
        for (let i = 0; i < this.#coupons.length; i++) {
            if (this.#coupons[i].getName() === coupon.getName()) {
                throw new InvalidCouponAdditionException();
            }
        }
        this.#coupons.push(coupon);
        if (coupon.getName() === "BOGO") {
            await BOGO.saveCoupon(coupon);
        } else {
            await Percent25.saveCoupon(coupon);
        }

        this.#notifyAll();
    }

}

export class InvalidProductAdditionException extends Error {
}

export class InvalidProductRemovalException extends Error {
}

export class InvalidCartCheckoutException extends Error {
}

export class InvalidCouponAdditionException extends Error {
}

export class InvalidCouponRemovalException extends Error {
}

export class OutOfStockException extends Error {
}

export class InvalidAdditionAmount extends Error {

}

export class InvalidRemovalAmount extends Error {

}

export class InvalidBudgetException extends Error {

}

export class InvalidAutoShopCartException extends Error {

}

export class LowBudgetException extends Error {
}