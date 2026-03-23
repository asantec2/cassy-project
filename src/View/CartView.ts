/**
 * The {@code CartView} class represents the user interface for the shopping cart.
 * It displays available products and cart contents, forwards user actions to
 * {@link CartController}, and updates when notified by the {@link Cart} model.
 */

import Cart, {
    InvalidCouponAdditionException,
    InvalidCouponRemovalException,
    InvalidCartCheckoutException,
    InvalidProductAdditionException,
    InvalidProductRemovalException, OutOfStockException
} from "../model/Cart.ts";
import CartController from "../Controller/CartController.ts";
import {InvalidBOGOApplicationException} from "../model/BOGO.ts";
import {InvalidPercentApplicationException} from "../model/Percent25.ts";

export default class CartView {
    #cart: Cart;
    #teamEl: HTMLUListElement;
    #cartController: CartController;
    #errorEl: HTMLSpanElement;
    #addFroyoDialog: HTMLDialogElement;
    #removeFroyoDialog: HTMLDialogElement;
    #couponEl: HTMLElement;

    //constructor
    constructor(cart: Cart, cartController: CartController) {
        this.#cart = cart;
        this.#cartController = cartController;
        this.#cart.registerListener(this);

        document.querySelector("#app")!.innerHTML = `
        <div id="cart">
           
           <p class="welcome-text">Welcome ${this.#cartController.getCashier().getUserName()}</p>

            <h2>Menu</h2>

            <div id="drink-images">
                <div class="drink">
                    <img src="/images/smothie.png" alt="Smoothie" width="300">
                    <p>Smoothie</p>
                    <strong>Strawberry Sunshine</strong>
                    <p></p>
                    <button id="add-smoothie">Add Smoothie</button>
                    <button id="remove-smoothie">Remove Smoothie</button>
                </div>

                <div class="drink">
                    <img src="/images/juice.png" alt="Juice" width="300">
                    <p>Juice</p>
                    <strong>Orange Juice</strong>
                    <p></p>
                    <button id="add-juice">Add Juice</button>
                    <button id="remove-juice">Remove Juice</button>
                </div>

                <div class="drink" id="froyo-section">
                    <img src="/images/froyo.png" alt="Frozen Yogurt" width="300">
                    <p>Frozen Yogurt</p>
                    <strong>Vanilla Froyo</strong>
                    <p></p>
                    <button id="show-add-froyo">Add Froyo</button>
                    <button id="show-remove-froyo">Remove Froyo</button>   
                </div>
            </div>

            <h3>Cart</h3>
            <ul></ul>
            
            <span id="error"></span><br />

            <div class="coupon-section">
                <h3>Coupons</h3>

                <div class="coupon">
                    <strong>BOGO</strong>
                    <p>Buy one drink, get one free.</p>
                    <button id="add-bogo">Add BOGO</button>
                    <button id="remove-bogo">Remove BOGO</button>
                </div>

                <div class="coupon">
                    <strong>25% OFF</strong>
                    <p>Get 25% off your total purchase.</p>
                    <button id="add-percent">Add 25% OFF</button>
                    <button id="remove-percent">Remove 25% OFF</button>
                </div>
            </div>

            <p></p>
            <button id="check-out">Check out</button>
        </div>
        `;

        this.#addFroyoDialog = document.createElement("dialog");
        this.#addFroyoDialog.id = "add-froyo-dialog";
        this.#addFroyoDialog.innerHTML = `
            <span id="add-froyo-error"></span><br />
            <label for="add-froyo-amount">Froyo amount</label>
            <input type="number" id="add-froyo-amount" />
            <button id="add-froyo">Add Froyo</button>
        `;
        this.#addFroyoDialog.querySelector("button")!
            .addEventListener("click", () => this.#addFroyo());
        document.body.appendChild(this.#addFroyoDialog);

        this.#removeFroyoDialog = document.createElement("dialog");
        this.#removeFroyoDialog.id = "remove-froyo-dialog";
        this.#removeFroyoDialog.innerHTML = `
            <span id="remove-froyo-error"></span><br />
            <label for="remove-froyo-amount">Froyo amount</label>
            <input type="number" id="remove-froyo-amount" />
            <button id="remove-froyo">Remove Froyo</button>
        `;
        this.#couponEl = document.createElement("div");
        this.#couponEl.className = "coupon-display";
        this.#couponEl.textContent = "No coupons added";


        this.#removeFroyoDialog.querySelector("button")!
            .addEventListener("click", () => this.#removeFroyo());
        document.body.appendChild(this.#removeFroyoDialog);

        this.#teamEl = document.querySelector("#cart > ul")!;
        this.#errorEl = document.querySelector("#error")! as HTMLSpanElement;
        this.#teamEl.appendChild(this.#couponEl);

        document.querySelector("#add-smoothie")!
            .addEventListener("click", () => this.#addSmoothie());

        document.querySelector("#remove-smoothie")!
            .addEventListener("click", () => this.#removeSmoothie());

        document.querySelector("#add-juice")!
            .addEventListener("click", () => this.#addJuice());

        document.querySelector("#remove-juice")!
            .addEventListener("click", () => this.#removeJuice());

        document.querySelector("#check-out")!
            .addEventListener("click", () => this.#checkOut());

        document.querySelector("#show-add-froyo")!
            .addEventListener("click", () => {
                this.#positionDialog(this.#addFroyoDialog);
                this.#addFroyoDialog.show();
            });

        document.querySelector("#show-remove-froyo")!
            .addEventListener("click", () => {
                this.#positionDialog(this.#removeFroyoDialog);
                this.#removeFroyoDialog.show();
            });

        document.querySelector("#add-bogo")!
            .addEventListener("click", () => this.#addBOGO());

        document.querySelector("#remove-bogo")!
            .addEventListener("click", () => this.#removeBOGO());

        document.querySelector("#add-percent")!
            .addEventListener("click", () => this.#addPercent25());

        document.querySelector("#remove-percent")!
            .addEventListener("click", () => this.#removePercent25());
    }

    /**
     * Positions add Froyo dialogue right underneath Frozen yogurt picture
     * @param dialog the HTMLDialogElement to be positioned on the page
     */
    #positionDialog(dialog: HTMLDialogElement) {
        const froyoImage = document.querySelector("#froyo-section img") as HTMLElement;
        const rect = froyoImage.getBoundingClientRect();

        dialog.style.position = "absolute";
        dialog.style.top = `${rect.bottom + window.scrollY + 5}px`;  // directly under image
        dialog.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
        dialog.style.transform = "translateX(-50%)"; // center under image
        dialog.style.margin = "0";
    }

    /**
     * Create display based on coupons in the cart
     */
    #updateCouponDisplay() {
        const coupons = this.#cart.getCoupons();

        if (coupons.length === 0) {
            this.#couponEl.textContent = "No coupons applied";
        } else {
            this.#couponEl.textContent =
                "Added coupons: " + coupons.map(c => c.getName()).join(", ");
        }
    }

    /**
     * Displays items in cart with quantity and total
     */
    notify() {
        this.#teamEl.replaceChildren();

        const headerEl = document.createElement("li");
        headerEl.innerHTML = `
            <table class="cart-table">
                <tr>
                    <th class="item-name">Product</th>
                    <th class="item-price">Price</th>
                    <th class="item-quantity">Quantity</th>
                </tr>
            </table>
        `;
        this.#teamEl.appendChild(headerEl);

        this.#cart.getItems().forEach((p, i) => {
            const cartEl = document.createElement("li");
            cartEl.innerHTML = `
                <table class="cart-table">
                    <tr>
                        <td class="item-name">${p.getName()}</td>
                        <td class="item-price">$${p.getPrice()}.00</td>
                        <td class="item-quantity">${this.#cart.getQuantities()[i]}</td>
                    </tr>
                </table>
            `;
            this.#teamEl.appendChild(cartEl);
        });

        const totalEl = document.createElement("li");
        totalEl.innerHTML = `
            <table class="cart-table">
                <tr>
                    <td class="item-name"><strong>Total</strong></td>
                    <td class="item-price"><strong>$${this.#cart.getTotal()}.00</strong></td>
                    <td class="item-quantity"></td>
                </tr>
            </table>
        `;
        this.#teamEl.appendChild(totalEl);

        this.#updateCouponDisplay();
        this.#teamEl.appendChild(this.#couponEl);
    }

    /**
     * Adds Smoothie to cart if addition is valid
     */
    async #addSmoothie() {
        try {
            await this.#cartController.addSmoothie();
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidProductAdditionException) {
                this.#errorEl.textContent =
                    "Strawberry Sunshine is unavailable at this time. Try again next time.";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Adds Frozen yogurt to cart if addition is valid
     */
    async #addFroyo() {
        const amount = this.#addFroyoDialog
            .querySelector<HTMLInputElement>("input[type='number']")!.valueAsNumber;

        try {
            await this.#cartController.addFroyo(amount);
            this.#addFroyoDialog.querySelector("#add-froyo-error")!.textContent = "";
            this.#addFroyoDialog.querySelector("input[type='number']")!
                .setAttribute("style", "border-color:;");
            this.#errorEl.textContent = "";
            this.#addFroyoDialog.close();
        } catch (e: any) {
            if (e instanceof InvalidProductAdditionException) {
                this.#addFroyoDialog.querySelector("input[type='number']")!
                    .setAttribute("style", "border-color:red;");
                this.#addFroyoDialog.querySelector("#add-froyo-error")!
                    .textContent = "Invalid Froyo amount or Vanilla Froyo is unavailable.";
                this.#errorEl.textContent =
                    "Vanilla Froyo is unavailable at this time. Try again next time.";
                this.#addFroyoDialog.close();
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Removes Frozen yogurt from cart if it has been added to cart
     */
    async #removeFroyo() {
        const amount = this.#removeFroyoDialog
            .querySelector<HTMLInputElement>("input[type='number']")!.valueAsNumber;

        try {
            await this.#cartController.removeFroyo(amount);
            this.#removeFroyoDialog.querySelector("#remove-froyo-error")!.textContent = "";
            this.#removeFroyoDialog.querySelector("input[type='number']")!
                .setAttribute("style", "border-color:;");
            this.#errorEl.textContent = "";
            this.#removeFroyoDialog.close();
        } catch (e: any) {
            if (e instanceof InvalidProductRemovalException) {
                this.#removeFroyoDialog.querySelector("input[type='number']")!
                    .setAttribute("style", "border-color:red;");
                this.#removeFroyoDialog.querySelector("#remove-froyo-error")!
                    .textContent = "Invalid Froyo amount or not enough Froyo in cart.";
                this.#errorEl.textContent = "Vanilla Froyo has not been added to cart!";
                this.#removeFroyoDialog.close();
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Removes Smoothie from cart if it has been added to cart
     */
    async #removeSmoothie() {
        try {
            await this.#cartController.removeSmoothie();
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidProductRemovalException) {
                this.#errorEl.textContent = "Strawberry Sunshine has not been added to cart!";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Adds juice to cart if addition is valid
     */
    async #addJuice() {
        try {
            await this.#cartController.addJuice();
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidProductAdditionException) {
                this.#errorEl.textContent =
                    "Orange Juice is unavailable at this time. Try again next time.";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Removes Juice from cart if it has been added to cart
     */
    async #removeJuice() {
        try {
            await this.#cartController.removeJuice();
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidProductRemovalException) {
                this.#errorEl.textContent = "Orange Juice has not been added to cart yet!";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Checkout of a cart by creating receipt and displaying it
     */
    async #checkOut() {
        try {
            await this.#cartController.checkOut();
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidCartCheckoutException) {
                this.#errorEl.textContent = "Cart is empty. Add items before checking out.";
            } else if (e instanceof InvalidBOGOApplicationException) {
                this.#errorEl.textContent =
                    "BOGO cannot be applied. Add more items before checking out.";
            } else if (e instanceof InvalidPercentApplicationException) {
                this.#errorEl.textContent =
                    "25 percent cannot be applied. Add items before checking out.";
            } else if (e instanceof OutOfStockException) {
                this.#errorEl.textContent = " Some items in cart are now currently out of stock ";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Adds BOGO to cart if addition is valid
     */
    async #addBOGO() {
        try {
            await this.#cartController.addBOGO();
            this.#errorEl.textContent = "";
           this.notify();
        } catch (e: any) {
            if (e instanceof InvalidCouponAdditionException) {
                this.#errorEl.textContent = "BOGO has already been added to the cart!";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Removes BOGO from cart if it has been added to cart
     */
    async #removeBOGO() {
        try {
            await this.#cartController.removeBOGO();
            this.#errorEl.textContent = "";
            this.notify();
        } catch (e: any) {
            if (e instanceof InvalidCouponRemovalException) {
                this.#errorEl.textContent = "BOGO has not been added to the cart!";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Adds Percent25 to cart if addition is valid
     */
    async #addPercent25() {
        try {
            await this.#cartController.addPercent25();
            this.#errorEl.textContent = "";
            this.notify();
        } catch (e: any) {
            if (e instanceof InvalidCouponAdditionException) {
                this.#errorEl.textContent =
                    "25% OFF coupon has already been added to the cart!";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Removes Percent25 from cart if it has been added to cart
     */
    async #removePercent25() {
        try {
            await this.#cartController.removePercent25();
            this.#errorEl.textContent = "";
            this.notify();
        } catch (e: any) {
            if (e instanceof InvalidCouponRemovalException) {
                this.#errorEl.textContent =
                    "25% OFF coupon has not been added to the cart!";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }
}