---
title: Flows of interaction for my POS system at a Drink store 
author: Cassandra Asante (asantec@myumanitoba.ca)
date: Winter 2026
---

# Flows of interaction
```mermaid
flowchart
subgraph **View Product and add to cart**

Start[[View screen]]--click view products--> ProductsDisplayed{Products displayed}
ProductsDisplayed -->SelectProduct[select product]
SelectProduct --product in stock--> AddCart{add to cart}
SelectProduct -.product out of stock .->ProductsDisplayed
AddCart -.addition successful.-> Done[[Product Added to cart]]

end

```
```mermaid
flowchart
subgraph **Checkout with Receipt**
CheckoutScreen[[checkout Screen]]--click checkout-->Checkout{check out}
Checkout -.cart empty .->CheckoutScreen
Checkout --valid cart-->Payment{Process payment}
Payment -. payment failed .-> CheckoutScreen
Payment -- payment successful -->Receipt[[Receipt generated]]

end
```