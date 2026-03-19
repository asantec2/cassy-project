import Receipt from "../model/Receipt.ts";
import CartController from "../Controller/CartController.ts";

export default class ReceiptView{
    #receipt :Receipt;
    #cartController :CartController;
    #itemsEl: HTMLUListElement;

    //constructor
    constructor(receipt:Receipt,cartController : CartController) {
        this.#receipt = receipt;
        this.#cartController = cartController;
        document.querySelector("#app")!.innerHTML = `
        <div id="receipt">
            <strong>Receipt</strong>
            <p></p>
            
            <img src="/images/receipt.png" alt="Receipt Image" width="400" />

         <ul></ul>

            <div style="margin-top: 10px;">
                <table class="cart-table">
                    <tr>
                        <td class="item-name"><strong>Total</strong></td>
                        <td class="item-price"><strong>$${this.#receipt.getCart().getTotal()}.00</strong></td>
                    </tr>
                </table>
         </div>
            <strong>Thank you for your purchase!</strong>
            <p></p>

            <button id="back-to-cart">Back to cart</button>
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

        this.#receipt.getCart().getItems().forEach((p) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <table class="cart-table">
                    <tr>
                        <td class="item-name">${p.getName()}</td>
                        <td class="item-price">$${p.getPrice()}.00</td>
                    </tr>
                </table>
            `;
            this.#itemsEl.appendChild(li);
        });
    }
}