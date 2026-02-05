import  CartController from "../Controller/CartController.ts";

export default class ProductView{
    #controller: CartController;

    constructor(controller: CartController) {
        this.#controller = controller;


    }

}