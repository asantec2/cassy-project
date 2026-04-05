---
title: My Booster Juice POS!
author: Cassandra Asante(asantec@myumanitoba.ca)
date: Winter 2026
---

# Running

You can start my app using `npm` and `npx`:

```bash
npm install
npx vite
```

# Other docs

* You can find my domain model in `domain.md`.
* You can find my flows of interaction in `flows.md`.


# Training the Markov Model

My app uses a trained Markov model for the auto-shopper feature.

To train the model, run:

```bash
npx ts-node ./Training/training.ts
```
Builds a Markov transition model based on product sequences
Saves the trained model to a file

After training completes, the output file is created at:
```bash
model.json
```
which is in the root directory of my project folder.

The output file (model.json) contains a Markov transition model stored as raw counts.

It includes the following fields:

1. numerators
 A 10 × 10 adjacency matrix of transition counts.
 Each row represents the current product.
 Each column represents the next product.
 Each value represents how many times that transition occurred.

2. denominators
 An array representing the total number of outgoing transitions for each product.

3. products
  An array listing all product names in index order.

4. labelIndexMap
 Maps labels used in the training data (a–j) to indices in the matrix.

