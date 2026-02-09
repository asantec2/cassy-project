import { expect, test } from 'vitest';
import Smoothie from "../src/model/Smoothie";
import Cart, {
    InvalidCartCheckoutException,
    InvalidProductAdditionException,
    InvalidProductRemovalException
} from "../src/model/Cart";
import Juice from "../src/model/Juice";

test('Can add Smoothie to cart',()=>{
    let product = new Smoothie("Strawberry Sunshine",15);
    let cart = new Cart();
    cart.addProduct(product);
    expect(cart.getItems()).contains(product);
});

test('Can add Juice to cart',()=>{
    let product = new Juice("Orange Juice",15);
    let cart = new Cart();
    cart.addProduct(product);
    expect(cart.getItems()).contains(product);
});

test('Can check out of cart successfully',()=>{
    let juice = new Juice("Orange Juice",15);
    let smoothie = new Smoothie("Strawberry Sunshine",15);
    let cart = new Cart();
    cart.addProduct(juice);
    cart.addProduct(smoothie);
    let receipt = cart.checkOut();

    expect(receipt.getTotal()).toBe(30);
    expect(cart.getItems().length).equals(0);
});

test('Can remove Smoothie from cart',()=>{
    let product = new Smoothie("Strawberry Sunshine",15);
    let cart = new Cart();
    cart.addProduct(product);
    cart.removeProduct(product);
    expect(cart.getItems()).not.toContain(product);
});

test('Can remove Juice from cart',()=>{
    let product = new Juice("Orange Juice",15);
    let cart = new Cart();
    cart.addProduct(product);
    cart.removeProduct(product);
    expect(cart.getItems()).not.toContain(product);
});

test('Cart notify listeners after adding Smoothie', () => {
    let product = new Smoothie("Strawberry Sunshine",10);
    let cart = new Cart();

    let notified = false;

    cart.registerListener({ notify: () => notified = true });

    cart.addProduct(product);

    expect(notified).equals(true);
});

test('Cart notify listeners after adding Juice', () => {
    let product = new Smoothie("Orange Juice",10);
    let cart = new Cart();

    let notified = false;

    cart.registerListener({ notify: () => notified = true });

    cart.addProduct(product);

    expect(notified).equals(true);
});

test('Cart notify listeners after Checkout', () => {
    let product = new Smoothie("Orange Juice",10);
    let cart = new Cart();

    let notified = false;

    cart.registerListener({ notify: () => notified = true });

    cart.addProduct(product);
    notified = false;
    cart.checkOut();

    expect(notified).equals(true);
});

test("Removing after checkout throws error", () => {
    let cart = new Cart();
    let product = new Smoothie("Strawberry Sunshine", 15);
    cart.addProduct(product);
    cart.checkOut();
    let exception = false;
    try {
        cart.removeProduct(product);
    } catch (e) {
        if (e instanceof InvalidProductRemovalException) {
            exception = true;
        } else {
            console.log("unexpected error" + e);
        }
    }
    expect(exception).equals(true);
});

test("Checkout throws error when cart is empty", () => {
    let cart = new Cart();
    let exception = false;

    try {
        cart.checkOut();
    } catch (e) {
        if (e instanceof InvalidCartCheckoutException) {
            exception = true;
        } else {
            console.log("unexpected error" + e);
        }
    }
    expect(exception).equals(true);
});

test("Remove Product throws error if product not in cart", () => {
    let product = new Smoothie("Strawberry Sunshine", 15);
    let cart = new Cart();
    let exception = false;

    try {
        cart.removeProduct(product);
    } catch (e) {
        if (e instanceof InvalidProductRemovalException) {
            exception = true;
        } else {
            console.log("unexpected error" + e);
        }
    }
    expect(exception).equals(true);
})

test("Add Product throws error when product is out of stock", () => {
    let product = new Smoothie("Strawberry Sunshine", 15);
    let cart = new Cart();
    let exception = false;

    while (product.getQuantity() > 0) {
        product.reduceQuantity();
    }

    try {
        cart.addProduct(product);
    } catch (e) {
        if (e instanceof InvalidProductAdditionException){
            exception = true;
        } else {
            console.log("unexpected error" + e);
        }
    }
    expect(exception).equals(true);
});





