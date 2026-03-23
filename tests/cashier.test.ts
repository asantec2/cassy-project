import {expect, test} from "vitest";
import db from "../src/model/connection";
import Cashier from "../src/model/Cashier";

async function resetDB() {
    await db().query("delete from cartCoupon");
    await db().query("delete from cartItem");
    await db().query("delete from receipt");
    await db().query("delete from cart");
    await db().query("delete from coupon");
    await db().query("delete from cashier");
}
test("Can get cashier by cashier username", async () => {
    await resetDB();
    await db().query(
        "insert into cashier(username, password) values($1, $2)",
        ["cassy", "1234"]
    );


    const cashier = await Cashier.getCashierByUsername("cassy");

    expect(cashier).not.toBeNull();
    expect(cashier!.getUserName()).toBe("cassy");
    expect(cashier!.getPassword()).toBe("1234");

});
test("get Cashier returns null if cashier does not exist", async () => {
    const cashier = await Cashier.getCashierByUsername("unknown");

    expect(cashier).toBeNull();
});
test("Returns all cashiers in database", async () => {
    await resetDB();
    await db().query(
        "insert into cashier(username, password) values($1, $2), ($3, $4)",
        ["cassy", "1234", "john", "gaby3"]
    );

    const cashiers = await Cashier.getAllCashiers();

    expect(cashiers.length).toBe(2);

    const usernames = cashiers.map(c => c.getUserName());
    expect(usernames).toContain("cassy");
    expect(usernames).toContain("john");
});

test("Returns empty array when no cashiers exist", async () => {
    await resetDB();
    const cashiers = await Cashier.getAllCashiers();

    expect(cashiers.length).toBe(0);
});