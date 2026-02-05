import Cart from "../model/Cart.ts";
import CartController from "../Controller/CartController.ts";
import Smoothie from "../model/Smoothie.ts";
export default class CartView{
    #cart :Cart;
    #teamEl : HTMLUListElement;
    #cartController : CartController;

    constructor(cart :Cart, cartController :CartController) {
        this.#cart = cart;
        this.#cartController = cartController;
        this.#cart.registerListener(this);


        document.querySelector("#app")!.innerHTML = `<div id='cart'>
        <button id="add-product">Add Product</button>
        <button id="remove-product">Remove product</button>
        <button id="check-out">Check out</button>
        <ul></ul>
        </div>`
        this.#teamEl = document.querySelector("#cart > ul")!;

        document.querySelector("#add-product")!.addEventListener("click",() => this.#cartController.addToCart());
        document.querySelector("#remove-product")!.addEventListener("click",()=> this.#cartController.removeFromCart(new Smoothie("StrawberrySunshine",10)));
        document.querySelector("#check-out")!.addEventListener("click",() => this.#cartController.checkOut());

    }
    notify(){
        this.#teamEl.replaceChildren();
        this.#cart.getItems().forEach((p)=>{
            let cartEl = document.createElement("li");
            cartEl.innerHTML = `<strong>${p.getName()}</strong>`;
            this.#teamEl.appendChild(cartEl);
        })
    }

}