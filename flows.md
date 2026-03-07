---
title: Flows of interaction for my POS system at a Drink store 
author: Cassandra Asante (asantec@myumanitoba.ca)
date: Winter 2026
---
# Flows of interaction


# Flows for Phase 2
## Create Account
```mermaid
 flowchart
     subgraph **Create Account** 
         CreateAccount[[Create Account]] --username and password--> ValidateCredentials{validate credentials}
         ValidateCredentials -.account created.-> ProductsView[[Product View Screen]]
         ValidateCredentials -.invalid username or password .-> CreateAccount
     end
```
## Sign In
```mermaid
flowchart
    subgraph **Sign in** 
        SignIn[[Sign In Screen]]-- username and password--> ValidateUserName{validate credentials }
        ValidateUserName -. invalid username or password.-> SignIn
        ValidateUserName -.sign in successful.-> ProductsView[[Product View Screen]]
    end
```
## Apply coupon
```mermaid
flowchart
    subgraph **Apply Coupon** 
        CartScreen[[Cart Screen]]--select coupon-->ApplyCoupon{apply coupon}
        ApplyCoupon -.coupon invalid for cart.-> CartScreen
        ApplyCoupon -.coupon applied successfully.-> CheckOutScreen[[checkout Screen]]
    end

```

# Flows for Phase 1
## View Product and add to cart
```mermaid
flowchart
subgraph **View Product and add to cart**

Start[[View screen]]--click view products--> ProductsDisplayed{Products displayed}
ProductsDisplayed -->SelectProduct[select product]
SelectProduct --product in stock--> AddCart{add to cart}
SelectProduct -.product out of stock .->ProductsDisplayed
SelectProduct --product quantity-->AddCart
AddCart -. invalid quantity .-> ProductsDisplayed
AddCart -.addition successful.-> Done[[Product Added to cart]]

end

```
## Checkout with receipt
```mermaid
flowchart
subgraph **Checkout with Receipt**
CheckoutScreen[[checkout Screen]]--click checkout-->Checkout{check out}
Checkout -.cart empty .->CheckoutScreen
Checkout --valid cart-->Receipt[[Receipt generated]]

end
```
### Changes
* The only initial flow I changed was in view products and add to cart where I added when a product is selected and it 
* requires a quantity to be entered after that input is gotten that quantity will be validated before addition to cart.