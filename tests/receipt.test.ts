import { expect, test } from "vitest";
import db from "../src/model/connection";
import Cashier from "../src/model/Cashier";
import Cart from "../src/model/Cart";
import Juice from "../src/model/Juice";
import Receipt from "../src/model/Receipt";

async function resetDB() {
    await db().query("delete from cartCoupon");
    await db().query("delete from cartItem");
    await db().query("delete from receipt");
    await db().query("delete from cart");
    await db().query("delete from coupon");
    await db().query("delete from cashier");
}

test("Can get receipts for cashier", async () => {
    await resetDB();

    await db().query(
        "insert into cashier(username, password) values($1, $2)",
        ["cassy", "1234"]
    );

    const cashier = await Cashier.getCashierByUsername("cassy");
    const product = await Juice.getJuiceByName("Orange Juice");

    const cart = new Cart();
    cart.addProduct(product, 2);
    await Cart.saveCart(cart, "cassy");

    const savedCart = await Cart.getCartByCashier("cassy");

    const testTime = "2026-03-22T15:00:00.000Z";

    const receipt = new Receipt(savedCart!, cashier!, testTime);
    await Receipt.saveReceipt(receipt);

    const receipts = await Receipt.getReceiptForCashier(cashier!);

    expect(receipts.length).toBe(1);
    expect(receipts[0].getCashier().getUserName()).toBe("cassy");
    expect(receipts[0].getCart().getItems()[0].getName()).toBe("Orange Juice");
    expect(receipts[0].getCart().getQuantities()[0]).toBe(2);

});

test("Returns empty array when cashier has no receipts", async () => {
    await resetDB();

    await db().query(
        "insert into cashier(username, password) values($1, $2)",
        ["cassy", "1234"]
    );

    const cashier = await Cashier.getCashierByUsername("cassy");
    const receipts = await Receipt.getReceiptForCashier(cashier!);

    expect(receipts.length).toBe(0);
});

test("Can get receipt by cart id", async () => {
    await resetDB();

    await db().query(
        "insert into cashier(username, password) values($1, $2)",
        ["cassy", "1234"]
    );

    const cashier = await Cashier.getCashierByUsername("cassy");
    const product = await Juice.getJuiceByName("Orange Juice");

    const cart = new Cart();
    cart.addProduct(product, 3);
    await Cart.saveCart(cart, "cassy");

    const savedCart = await Cart.getCartByCashier("cassy");

    const receipt = new Receipt(savedCart!, cashier!, "2026-03-22T11:30:00");
    await Receipt.saveReceipt(receipt);

    // @ts-ignore
    const loadedReceipt = await Receipt.getReceiptByCartId(savedCart!.getCartId());

    expect(loadedReceipt.getCashier().getUserName()).toBe("cassy");
    expect(loadedReceipt.getCart().getItems()[0].getName()).toBe("Orange Juice");
    expect(loadedReceipt.getCart().getQuantities()[0]).toBe(3);
});