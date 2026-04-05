/**
 * The {@code ReceiptView} class represents the user interface for displaying a {@link Receipt}.
 * It shows purchased {@link Cart}which contains items and their quantity, the total cost,and
 * the time transaction was made and provides navigation back to the cart.
 */

import Receipt from "../model/Receipt.ts";
import CartController from "../Controller/CartController.ts";

export default class ReceiptView {
    #receipt: Receipt;
    #cartController: CartController;
    #itemsEl: HTMLUListElement;
    #couponEl: HTMLLIElement;

    constructor(receipt: Receipt, cartController: CartController) {
        this.#receipt = receipt;
        this.#cartController = cartController;

        this.#couponEl = document.createElement("li");
        this.#couponEl.className = "coupon-display";

        document.querySelector("#app")!.innerHTML = `
<div id="receipt">

    <p><strong>Cashier: ${this.#receipt.getCashier().getUserName()}</strong></p>

    <img src="/images/receipt.png" alt="Receipt Image" width="400" />

    <ul></ul>

    <div style="margin-top: 10px;">
        <table class="cart-table">
            <tr>
                <td class="item-name"><strong>Total</strong></td>
                <td class="item-price"><strong>$${this.#receipt.getCart().getTotal()}.00</strong></td>
                <td class="item-quantity"></td>
            </tr>
        </table>
    </div>

    <p><strong>Date:</strong> ${new Date(this.#receipt.getTimeStamp()).toLocaleString()}</p>

    <strong>Thank you for your purchase!</strong>
    <p></p>

    <button id="back-to-cart">Return to cart</button>
</div>
`;

        this.#itemsEl = document.querySelector("#receipt > ul")!;

        document.querySelector("#back-to-cart")!
            .addEventListener("click", () => this.#cartController.showCartView());

        this.#showItems();
    }

    /**
     * Renders all purchased items on the receipt.
     * Clears the current list and rebuilds it from the receipt data.
     */
    #showItems(): void {
        this.#itemsEl.replaceChildren();

        const headerEl = document.createElement("li");
        headerEl.innerHTML = `
        <table class="cart-table">
            <tr>
                <th class="item-name">Product</th>
                <th class="item-price">Unit Price</th>
                <th class="item-quantity">Quantity</th>
            </tr>
        </table>
        `;
        this.#itemsEl.appendChild(headerEl);

        this.#receipt.getCart().getItems().forEach((p, i) => {
            const quantity = this.#receipt.getCart().getQuantities()[i];

            const li = document.createElement("li");
            li.innerHTML = `
            <table class="cart-table">
                <tr>
                    <td class="item-name">${p.getName()}</td>
                    <td class="item-price">$${p.getPrice()}.00</td>
                    <td class="item-quantity">${quantity}</td>
                </tr>
            </table>
            `;
            this.#itemsEl.appendChild(li);
        });

        this.#updateCouponDisplay();
        this.#itemsEl.appendChild(this.#couponEl);
    }

    /**
     * Create display based on coupons in the cart
     */
    #updateCouponDisplay() {
        const coupons = this.#receipt.getCart().getCoupons();

        if (coupons.length === 0) {
            this.#couponEl.textContent = "No coupons applied";
        } else {
            this.#couponEl.textContent =
                "Applied coupons: " + coupons.map(c => c.getName()).join(", ");
        }
    }
}