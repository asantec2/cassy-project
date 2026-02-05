import Cart from "../model/Cart.ts";
import Smoothie from "../model/Smoothie.ts";
import  CartView from "../View/CartView.ts";
import type Product from "../model/Product.ts";

export default class CartController{
    #cart :Cart;
    #cartView :CartView;
    constructor() {
        this.#cart = new Cart();
        this.#cartView = new CartView(this.#cart,this);
    }
    addToCart(){
        let product = new Smoothie("StrawberrySunshine",10);
        this.#cart.addProduct(product);
        console.log("Product added to Cart")
        console.log(this.#cart);
    }
    removeFromCart(product:Product){
        this.#cart.removeProduct(product);
        console.log("Product removed");

    }
    checkOut(){
        this.#cart.checkOut();
        console.log("checked out successfully");
    }
}