/**
 * The {@code training} class is responsible for building a Markov chain model
 * from a CSV dataset of product transitions.
 *
 * It reads sequences of product labels (a–j) and records how often one product
 * follows another, storing this information as transition counts.
 */

import * as fs from "node:fs";

export default class training {



    /**
     * Maps product labels (a–j) to indices used in the transition matrix.
     */
    labelIndexMap: Record<string, number> = {
        a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7, i: 8, j: 9

    };

    /**
     * Maps product labels to their full product names.
     */
    labelProductMap: Record<string, string> = {
        a: "Red Sunrise",
        b: "Mango Hurricane",
        c: "Strawberry Froyo",
        d: "Apple Juice",
        e: "Ripped Berry",
        f: "Blueberry Froyo",
        g: "Maui Juice",
        h: "Pirates Nectar",
        i: "Mango Froyo",
        j: "Canadian Colada"

    };

    /**
     * List of all product names in index order.
     */
     products: string[] = ["Red Sunrise",
        "Mango Hurricane",
        "Strawberry Froyo",
        "Apple Juice",
        "Ripped Berry",
        "Blueberry Froyo",
        "Maui Juice",
        "Pirates Nectar",
        "Mango Froyo",
        "Canadian Colada"]


    numerators: number[][];
    denominators: number[];
    size: number;

    constructor() {
        this.size = 10;
        this.numerators = new Array(this.size);


        for (let i = 0; i < this.size; i++) {
            this.numerators[i] = new Array(this.size);


            for (let j = 0; j < this.size; j++) {
                this.numerators[i][j] = 0;
            }
        }


        this.denominators = new Array(this.size);
        for (let i = 0; i < this.size; i++) {
            this.denominators[i] = 0;
        }
    }
    /**
     * Trains the Markov model using a CSV file.
     * The method counts transitions between consecutive products.
     * @param filePath the path to the training CSV file
     */
    train(filePath: string): void {
        const csvText = fs.readFileSync(filePath, "utf-8");
        const lines = csvText.trim().split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.length !== 0){

            const states = line.split(",").map((s: string) => s.trim());

            for (let j = 0; j < states.length - 1; j++) {
                const fromLabel = states[j];
                const toLabel = states[j + 1];

                const fromIndex = this.labelIndexMap[fromLabel];
                const toIndex = this.labelIndexMap[toLabel];


                this.numerators[fromIndex][toIndex]++;
                this.denominators[fromIndex]++;
            }
        }
        }
    }

    /**
     * Saves the trained Markov model to a JSON file.
     * The file contains transition counts and metadata needed
     * for prediction.
     * @param filePath the file path where the model will be saved
     */
    saveModel(filePath: string): void {
        const model = {
            numerators: this.numerators,
            denominators: this.denominators,
            labelIndexMap: this.labelIndexMap,
            products: this.products
        };

        fs.writeFileSync(filePath, JSON.stringify(model, null, 2), "utf-8");
    }

}
/**
 * Executes training and saves the model.
 */
const trainer = new training();
trainer.train("./Training/training.csv");
trainer.saveModel("model.json");