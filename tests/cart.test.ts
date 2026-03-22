import { expect, test } from 'vitest';
import Smoothie from "../src/model/Smoothie";
import Cart, {
    InvalidCartCheckoutException,
    InvalidProductAdditionException,
    InvalidProductRemovalException
} from "../src/model/Cart";
import Juice from "../src/model/Juice";
import FrozenYogurt from "../src/model/FrozenYogurt";
import BOGO from "../src/model/BOGO";
import Percent25 from "../src/model/Percent25";
import Cashier from "../src/model/Cashier";
import db from "../src/model/connection";

test('Can add Smoothie to cart',()=>{
    let product = new Smoothie("Strawberry Sunshine",15,10);
    let cart = new Cart();
    cart.addProduct(product,5);
    const index = cart.getItems().indexOf(product);
    expect(cart.getItems()).contains(product);
    expect(cart.getQuantities()[index]).toBe(5);
});

test('Can add Juice to cart',()=>{
    let product = new Juice("Orange Juice",15,10);
    let cart = new Cart();
    cart.addProduct(product,6);
    const index = cart.getItems().indexOf(product);
    expect(cart.getItems()).contains(product);
    expect(cart.getQuantities()[index]).toBe(6);
});
test('Can add Frozen Yogurt to cart',()=>{
    let product = new FrozenYogurt("Vanilla froyo",15,10);
    let cart = new Cart();
    cart.addProduct(product,6);
    const index = cart.getItems().indexOf(product);
    expect(cart.getItems()).contains(product);
    expect(cart.getQuantities()[index]).toBe(6);
});
test('Can add BOGO to cart',async ()=>{
    let coupon = new BOGO("BOGO","buy one get one free");
    let cart = new Cart();
    await cart.addCoupon(coupon);
    expect(cart.getCoupons()).contains(coupon);
});
test('Can add Percent25 to cart',async ()=>{
    let coupon = new Percent25("Percent25","get 25% off");
    let cart = new Cart();
    await cart.addCoupon(coupon);
    expect(cart.getCoupons()).contains(coupon);
});
test('Can remove BOGO from cart',()=>{
    let coupon = new BOGO("BOGO","buy one get one free");
    let cart = new Cart();
    cart.addCoupon(coupon);
    cart.removeCoupon(coupon);
    expect(cart.getItems()).not.toContain(coupon);
});
test('Can remove Percent25 from cart',()=>{
    let coupon = new Percent25("Percent25","get 25% off");
    let cart = new Cart();
    cart.addCoupon(coupon);
    cart.removeCoupon(coupon);
    expect(cart.getItems()).not.toContain(coupon);
});

test('Can remove Smoothie from cart',()=>{
    let product = new Smoothie("Strawberry Sunshine",15,10);
    let cart = new Cart();
    cart.addProduct(product,5);
    cart.removeProduct(product,5);
    expect(cart.getItems()).not.toContain(product);
    expect(cart.getQuantities().length).toBe(0);
});
test('Can remove Juice from cart',()=>{
    let product = new Juice("Orange Juice",15,10);
    let cart = new Cart();
    cart.addProduct(product,6);
    cart.removeProduct(product,6);
    expect(cart.getItems()).not.toContain(product);
    expect(cart.getQuantities().length).toBe(0);
});
test('Can remove Frozen Yogurt from cart',()=>{
    let product = new FrozenYogurt("Vanilla froyo",15,10);
    let cart = new Cart();
    cart.addProduct(product,6);
    cart.removeProduct(product,6);
    expect(cart.getItems()).not.toContain(product);
    expect(cart.getQuantities().length).toBe(0);
});

test('Cart notify listeners after adding Smoothie', () => {
    let product = new Smoothie("Strawberry Sunshine",10,10);
    let cart = new Cart();

    let notified = false;

    cart.registerListener({ notify: () => notified = true });

    cart.addProduct(product,5);

    expect(notified).equals(true);
});
test('Cart notify listeners after adding Juice', () => {
    let product = new Smoothie("Orange Juice",10,10);
    let cart = new Cart();

    let notified = false;

    cart.registerListener({ notify: () => notified = true });

    cart.addProduct(product,4);

    expect(notified).equals(true);
});
test('Cart notify listeners after adding Frozen Yogurt', () => {
    let product = new FrozenYogurt("Vanilla Froyo",10,10);
    let cart = new Cart();

    let notified = false;

    cart.registerListener({ notify: () => notified = true });

    cart.addProduct(product,4);

    expect(notified).equals(true);
});
test("Remove Product throws error if product not in cart", () => {
    let product = new Smoothie("Strawberry Sunshine", 15,10);
    let cart = new Cart();
    let exception = false;

    try {
        cart.removeProduct(product,5);
    } catch (e) {
        if (e instanceof InvalidProductRemovalException) {
            exception = true;
        } else {
            console.log("unexpected error" + e);
        }
    }
    expect(exception).equals(true);
});
test("Add Product throws error when product is out of stock", () => {
    let product = new Smoothie("Strawberry Sunshine", 15,10);
    let cart = new Cart();
    let exception = false;

    while (product.getQuantity() > 0) {
        product.reduceQuantity(10);
    }

    try {
        cart.addProduct(product,1);
    } catch (e) {
        if (e instanceof InvalidProductAdditionException){
            exception = true;
        } else {
            console.log("unexpected error" + e);
        }
    }
    expect(exception).equals(true);
});
async function insertCashier() {
    await db().query(
        "insert into cashier(username, password) values($1, $2)",
        ["cassy", "1234"]
    );
}

test('Can check out of cart successfully', async () => {
    await resetDB();
    await insertCashier();

    let cashier = new Cashier("cassy", "1234");
    let juice = await Juice.getJuiceByName("Orange Juice");
    let smoothie = await Smoothie.getSmoothieByName("Strawberry Sunshine");
    let cart = new Cart();

    cart.addProduct(juice, 1);
    cart.addProduct(smoothie, 1);

    await Cart.saveCart(cart, cashier.getUserName());

    let receipt = await cart.checkOut(cashier);

    expect(receipt.getCart().getTotal()).toBe(
        juice.getPrice() + smoothie.getPrice()
    );
    expect(cart.getItems().length).toBe(0);
    expect(cart.getQuantities().length).toBe(0);
    expect(cart.getTotal()).toBe(0);
});


test("Checkout throws error when cart is empty", async () => {
    let cashier = new Cashier("cassy", "1234");
    let cart = new Cart();

    let exception = false;

    try {
        await cart.checkOut(cashier);
    } catch (e) {
        if (e instanceof InvalidCartCheckoutException) {
            exception = true;
        } else {
            console.log("unexpected error " + e);
        }
    }

    expect(exception).toBe(true);
});

test("Removing after checkout throws error", async () => {
    await resetDB();
    await insertCashier();

    let cashier = new Cashier("cassy", "1234");
    let cart = new Cart();
    let product = await Smoothie.getSmoothieByName("Strawberry Sunshine");

    cart.addProduct(product, 5);

    await Cart.saveCart(cart, cashier.getUserName());
    await cart.checkOut(cashier);

    let exception = false;

    try {
        cart.removeProduct(product, 1);
    } catch (e) {
        if (e instanceof InvalidProductRemovalException) {
            exception = true;
        } else {
            console.log("unexpected error " + e);
        }
    }

    expect(exception).toBe(true);
});

test('Cart notify listeners after checkout', async () => {
    await resetDB();
    await insertCashier();

    let cashier = new Cashier("cassy", "1234");
    let product = await Juice.getJuiceByName("Orange Juice");
    let cart = new Cart();

    let notified = false;

    cart.registerListener({ notify: () => notified = true });

    cart.addProduct(product, 5);
    notified = false;

    await Cart.saveCart(cart, cashier.getUserName());
    await cart.checkOut(cashier);

    expect(notified).toBe(true);
});
async function resetDB() {
    await db().query("delete from cartCoupon");
    await db().query("delete from cartItem");
    await db().query("delete from receipt");
    await db().query("delete from cart");
    await db().query("delete from coupon");
    await db().query("delete from cashier");
}
test("Can get full cart by id with items and coupons", async () => {
    await resetDB();
    await db().query(
        "insert into cashier(username, password) values($1, $2)",
        ["cassy", "1234"]
    );

    await db().query(
        "insert into coupon(name, description) values($1, $2)",
        ["BOGO", "buy one get one free"]
    );

    let cart = new Cart();
    let product = await Smoothie.getSmoothieByName("Strawberry Sunshine");

    cart.addProduct(product, 2);
    cart.loadCoupon(new BOGO("BOGO", "buy one get one free"));

    await Cart.saveCart(cart, "cassy");

    let loadedCart = await Cart.getCartById(cart.getCartId()!);

    expect(loadedCart.getItems().length).toBe(1);
    expect(loadedCart.getItems()[0].getName()).toBe("Strawberry Sunshine");
    expect(loadedCart.getQuantities()[0]).toBe(2);
    expect(loadedCart.getCoupons().length).toBe(1);
    expect(loadedCart.getCoupons()[0].getName()).toBe("BOGO");
});
test("Can get coupons for cart", async () => {
    await resetDB();
    await db().query(
        "insert into cashier(username, password) values($1, $2)",
        ["cassy", "1234"]
    );

    await db().query(
        "insert into coupon(name, description) values($1, $2)",
        ["BOGO", "buy one get one free"]
    );

    await db().query(
        "insert into coupon(name, description) values($1, $2)",
        ["PERCENT25", "25 percent off"]
    );

    let cart = new Cart();
    cart.loadCoupon(new BOGO("BOGO", "buy one get one free"));
    cart.loadCoupon(new Percent25("PERCENT25", "25 percent off"));

    await Cart.saveCart(cart, "cassy");

    let coupons = await Cart.getCouponsForCart(cart.getCartId()!);

    expect(coupons.length).toBe(2);
    expect(coupons[0].getName()).toBe("BOGO");
    expect(coupons[1].getName()).toBe("PERCENT25");
});
test("Can get cart by id", async () => {
    await resetDB();
    await db().query(
        "insert into cashier(username, password) values($1, $2)",
        ["cassy", "1234"]
    );

    let cart = new Cart();
    let product = await Smoothie.getSmoothieByName("Strawberry Sunshine");

    cart.addProduct(product, 2);
    await Cart.saveCart(cart, "cassy");

    let loadedCart = await Cart.getCartById(cart.getCartId()!);

    expect(loadedCart.getCartId()).toBe(cart.getCartId());
    expect(loadedCart.getItems()[0].getName()).toBe("Strawberry Sunshine");
    expect(loadedCart.getQuantities()[0]).toBe(2);
});
test("Can get items for cart", async () => {
    await  resetDB();
    await db().query(
        "insert into cashier(username, password) values($1, $2)",
        ["cassy", "1234"]
    );

    let cart = new Cart();
    let juice = await Juice.getJuiceByName("Orange Juice");
    let smoothie = await Smoothie.getSmoothieByName("Strawberry Sunshine");

    cart.addProduct(juice, 1);
    cart.addProduct(smoothie, 2);

    await Cart.saveCart(cart, "cassy");

    let items = await Cart.getItemsForCart(cart.getCartId()!);

    expect(items.length).toBe(2);
    expect(items[0].product.getName()).toBe("Orange Juice");
    expect(items[0].quantity).toBe(1);
    expect(items[1].product.getName()).toBe("Strawberry Sunshine");
    expect(items[1].quantity).toBe(2);
});
test("Can get cart by cashier", async () => {
    await resetDB();
    await db().query(
        "insert into cashier(username, password) values($1, $2)",
        ["cassy", "1234"]
    );

    let cart = new Cart();
    let product = await Juice.getJuiceByName("Orange Juice");

    cart.addProduct(product, 3);
    await Cart.saveCart(cart, "cassy");

    let loadedCart = await Cart.getCartByCashier("cassy");

    expect(loadedCart).not.toBeNull();
    expect(loadedCart!.getItems()[0].getName()).toBe("Orange Juice");
    expect(loadedCart!.getQuantities()[0]).toBe(3);
});
test("Getting cart by cashier returns null when cart does not exist", async () => {
    let loadedCart = await Cart.getCartByCashier("unknownUser");
    expect(loadedCart).toBeNull();
});





