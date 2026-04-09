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
    InvalidProductRemovalException, OutOfStockException, InvalidRemovalAmount, InvalidAdditionAmount,
    InvalidBudgetException, LowBudgetException, InvalidAutoShopCartException
} from "../model/Cart.ts";
import CartController from "../Controller/CartController.ts";
import {InvalidBOGOApplicationException} from "../model/BOGO.ts";
import {InvalidPercentApplicationException} from "../model/Percent25.ts";
import  Smoothie from "../model/Smoothie.ts";
import Product from "../model/Product.ts";
import Juice from "../model/Juice.ts";
import FrozenYogurt from "../model/FrozenYogurt.ts";
import {
    InvalidPreviousProductException,
    NoOutgoingTransitionException,
    UntrainedMarkovModeException
} from "../model/MarkovModel.ts";

export default class CartView {
    #cart: Cart;
    #teamEl: HTMLUListElement;
    #cartController: CartController;
    #errorEl: HTMLSpanElement;
    #addFroyoDialog: HTMLDialogElement;
    #removeFroyoDialog: HTMLDialogElement;
    #couponEl: HTMLElement;
    #selectedAddFroyo?: FrozenYogurt;
    #selectedRemoveFroyo?: FrozenYogurt;
    #autoShopDialog: HTMLDialogElement;

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
            
                   <div id="product-container"></div>
            </div>

            <h3>Cart</h3>
            <ul></ul>
            
            <span id="cart_error"></span><br />

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
            <p></p>
            <button id="open-auto-shop">Auto Shop</button>
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
        this.#autoShopDialog = document.createElement("dialog");
        this.#autoShopDialog.id = "auto-shop-dialog";
        this.#autoShopDialog.innerHTML = `
            <span id="auto-shop-error"></span><br />
            <label for="add-budget-amount">Budget amount</label>
            <input type="number" id="add-budget-amount" />
            <button id="confirm-auto-shop">Auto Shop</button>
        `;
        this.#autoShopDialog.querySelector("#confirm-auto-shop")!
            .addEventListener("click", async () => {
                await this.#autoShop();
            });
        document.body.appendChild(this.#autoShopDialog);

        document.querySelector("#open-auto-shop")!
            .addEventListener("click", () => {
                const openButton = document.querySelector("#open-auto-shop")! as HTMLElement;
                this.#positionDialog(this.#autoShopDialog, openButton);
                this.#autoShopDialog.showModal();
            });

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
        this.#errorEl = document.querySelector("#cart_error")! as HTMLSpanElement;
        this.#teamEl.appendChild(this.#couponEl);


        document.querySelector("#check-out")!
            .addEventListener("click", () => this.#checkOut());


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
     * @param anchorEl
     */
    #positionDialog(dialog: HTMLDialogElement, anchorEl: HTMLElement) {
        const rect = anchorEl.getBoundingClientRect();

        dialog.style.position = "absolute";
        dialog.style.top = `${rect.bottom + window.scrollY + 5}px`;
        dialog.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
        dialog.style.transform = "translateX(-50%)";
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
    async #addSmoothie(product: Smoothie) {
        try {
            await this.#cartController.addSmoothie(product);
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidProductAdditionException) {
                this.#errorEl.textContent =
                    `${product.getName()} is unavailable at this time. Try again next time.`;
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Adds several different products to cart based on budget given
     */
    async #autoShop() {
        const amount = this.#autoShopDialog
            .querySelector<HTMLInputElement>("input[type='number']")!.valueAsNumber;

        try {
            await this.#cartController.autoShop(amount);
            this.#autoShopDialog.querySelector("#auto-shop-error")!.textContent = "";
            this.#autoShopDialog.querySelector("input[type='number']")!
                .setAttribute("style", "border-color:;");
            this.#errorEl.textContent = "";
            this.#autoShopDialog.close();
        } catch (e: any) {
            if (e instanceof InvalidPreviousProductException) {
                this.#errorEl.textContent =
                    "Previous product added to cart cannot be used to auto shop. Please add another product to try again.";
                    this.#autoShopDialog.close();
            } else if (e instanceof UntrainedMarkovModeException) {
                this.#errorEl.textContent =
                    "Model has not been trained. Please train the model and try again.";
                this.#autoShopDialog.close();
            } else if (e instanceof NoOutgoingTransitionException) {
                this.#errorEl.textContent =
                    "There are no products after the previous added product. Please add another product to try again.";
                this.#autoShopDialog.close();
            } else if (e instanceof InvalidBudgetException) {
                this.#autoShopDialog.querySelector("input[type='number']")!
                    .setAttribute("style", "border-color:red;");
                this.#autoShopDialog.querySelector("#auto-shop-error")!
                    .textContent = "The budget is invalid. Please enter a number greater than 0.";
            } else if (e instanceof LowBudgetException) {
                    this.#errorEl.textContent = "The budget is too small to add the next product.";
                this.#autoShopDialog.close();
            } else if (e instanceof InvalidAutoShopCartException) {
                this.#errorEl.textContent =
                    "There are no products in cart. Please add a product to try again.";
                     this.#autoShopDialog.close();
            } else if (e instanceof InvalidProductAdditionException) {
                this.#errorEl.textContent = `Next product to be added to Cart is currently unavailable.Please try again next time.`;
                this.#autoShopDialog.close();
            }

            else {
                console.log("unexpected error " , e);
            }
        }
    }

    /**
     *Adds frozen yogurt to cart if addition is valid
     */
    async #addFroyo() {
        const amount = this.#addFroyoDialog
            .querySelector<HTMLInputElement>("input[type='number']")!.valueAsNumber;

        try {
            await this.#cartController.addFroyo(this.#selectedAddFroyo!, amount);
            this.#addFroyoDialog.querySelector("#add-froyo-error")!.textContent = "";
            this.#addFroyoDialog.querySelector("input[type='number']")!
                .setAttribute("style", "border-color:;");
            this.#errorEl.textContent = "";
            this.#addFroyoDialog.close();
        } catch (e: any) {
            if (e instanceof InvalidAdditionAmount) {
                this.#addFroyoDialog.querySelector("input[type='number']")!
                    .setAttribute("style", "border-color:red;");
                this.#addFroyoDialog.querySelector("#add-froyo-error")!
                    .textContent =
                    `Invalid ${this.#selectedAddFroyo!.getName()} amount. Please enter a number greater than 0.`;
            } else if (e instanceof InvalidProductAdditionException) {
                this.#errorEl.textContent =
                    `${this.#selectedAddFroyo!.getName()} is unavailable at this time. Try again next time.`;
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
            await this.#cartController.removeFroyo(this.#selectedRemoveFroyo!, amount);
            this.#removeFroyoDialog.querySelector("#remove-froyo-error")!.textContent = "";
            this.#removeFroyoDialog.querySelector("input[type='number']")!
                .setAttribute("style", "border-color:;");
            this.#errorEl.textContent = "";
            this.#removeFroyoDialog.close();
        } catch (e: any) {
            if (e instanceof InvalidRemovalAmount) {
                this.#removeFroyoDialog.querySelector("input[type='number']")!
                    .setAttribute("style", "border-color:red;");
                this.#removeFroyoDialog.querySelector("#remove-froyo-error")!
                    .textContent =
                    `Invalid ${this.#selectedRemoveFroyo!.getName()} amount. Please enter a number greater than 0.`;
            } else if (e instanceof InvalidProductRemovalException) {
                this.#errorEl.textContent =
                    `${this.#selectedRemoveFroyo!.getName()} has not been added to cart! Please add product before removal.`;
                    this.#removeFroyoDialog.close();
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Removes Smoothie from cart if it has been added to cart
     */
    async #removeSmoothie(product:Smoothie) {
        try {
            await this.#cartController.removeSmoothie(product);
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidProductRemovalException) {
                this.#errorEl.textContent = `${product.getName()} has not been added to cart yet! Please add product before removal.`;
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Adds juice to cart if addition is valid
     */
    async #addJuice(product: Juice) {
        try {
            await this.#cartController.addJuice(product);
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidProductAdditionException) {
                this.#errorEl.textContent =
                    `${product.getName()} is unavailable at this time. Try again next time.`;
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Removes Juice from cart if it has been added to cart
     */
    async #removeJuice(product:Juice) {
        try {
            await this.#cartController.removeJuice(product);
            this.#errorEl.textContent = "";
        } catch (e: any) {
            if (e instanceof InvalidProductRemovalException) {
                this.#errorEl.textContent = `${product.getName()} has not been added to cart yet! Please add product before removal.`;
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
                this.#errorEl.textContent = " Some items in cart are now currently out of stock.Please remove them before checking out. ";
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
                this.#errorEl.textContent = "BOGO has already been added to the cart and cannot be added twice!";
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
                this.#errorEl.textContent = "BOGO has not been added to the cart! Please add BOGO coupon before removal.";
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
                    "25% OFF coupon has already been added to the cart and cannot be added twice!";
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
                    "25% OFF coupon has not been added to the cart!Please add 25% coupon before removal";
            } else {
                console.log("unexpected error " + e);
            }
        }
    }

    /**
     * Display all products in the store for purchase
     * @param products the products instore to be displayed
     */
    displayProducts(products: Array<Product>) {
        const container = document.getElementById("product-container")!;
        container.innerHTML = "";

        products.forEach((product) => {
            const div = document.createElement("div");
            div.className = "drink";

            const imageName = product.getName().replaceAll(" ", "");
            let type = "";

            if (product instanceof Smoothie) {
                type = "Smoothie";
            } else if (product instanceof Juice) {
                type = "Juice";
            } else if (product instanceof FrozenYogurt) {
                type = "Frozen Yogurt";
            }

            div.innerHTML = `
            <img src="/images/${imageName}.png" alt="${type}" width="150">
            <p>${type}</p>
            <strong>${product.getName()}</strong>
            <p>$${product.getPrice()}</p>
            <button class="add-button">Add ${type}</button>
            <button class="remove-button">Remove ${type}</button>
        `;
            const addButton = div.querySelector(".add-button") as HTMLButtonElement;
            const removeButton = div.querySelector(".remove-button") as HTMLButtonElement;

            if (product instanceof FrozenYogurt) {
                addButton.addEventListener("click", (event) => {
                    this.#selectedAddFroyo = product;
                    const button = event.currentTarget as HTMLElement;
                    this.#positionDialog(this.#addFroyoDialog, button);
                    this.#addFroyoDialog.showModal();
                });

                removeButton.addEventListener("click", (event) => {
                    this.#selectedRemoveFroyo = product;
                    const button = event.currentTarget as HTMLElement;
                    this.#positionDialog(this.#removeFroyoDialog,button);
                    this.#removeFroyoDialog.showModal();
                });

            } else if (product instanceof Smoothie) {
                addButton.addEventListener("click", () => this.#addSmoothie(product));
                removeButton.addEventListener("click", () => this.#removeSmoothie(product));
            } else if (product instanceof Juice) {
                addButton.addEventListener("click", () => this.#addJuice(product));
                removeButton.addEventListener("click", () => this.#removeJuice(product));
            }

            container.appendChild(div);
        });
    }
}