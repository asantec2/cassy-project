---
title: Domain model for my Booster Juice POS system . 
author: Cassandra Asante (asantec@myumanitoba.ca)
date: Winter 2026
---

# Domain model

```mermaid
classDiagram

class Product{
    <<abstract>>
    -~const string name 
    - number price
    - number quantity

    + getName() string
    + getPrice() number
    + getQuantity() number
    + reduceQuantity() void
    + increaseQuantity() void
    
}
note for Product"
  name must not be empty
  price > 0
  quantity > 0
"
class Smoothie{ 
    
    + getQuantity() number
    + reduceQuantity() void
    + increaseQuantity() void
}

class Juice{
  
    + getQuantity() number
    + reduceQuantity() void
    + increaseQuantity() void
 }
 Product --|> Smoothie
 Product --|> Juice
 Product --|> FrozenYogurt

class FrozenYogurt{
    
    + getQuantity() number
    + reduceQuantity() void
    + increaseQuantity() void
}
class Cart{
    - Array~Product~ items
    - Array~Listeners~ listeners
    - Array~Coupon~ coupons
    -~ number cartNumber
    - number total
    - notifyAll() void
    + addProduct(Product product)void
    + removeProduct(Product product) void
    + getItems() Array~Product~
    + getTotal() number
    + checkOut() Receipt
    + addCoupon() void
    + registerListener(Listener listener) void
}
note for Cart"
total > 0
"
class  Coupon{
    <<interface>>
    +applyCoupon(Cart cart) void
    
}
class BOGO{
    -~string name 
    -string description
    +applyCoupon(Cart cart) void
    
}
note for BOGO"
 name must not be empty
 description must not be empty
 "
class 25Percent{
    -~string name
    -string description
    +applyCoupon(Cart cart) void
    
 }
 note for 25Percent"
 name must not be empty
 description must not be empty
 "
 Coupon --|> BOGO
 Coupon --|> 25Percent
 
class Cashier{
    -~string username 
    -~string password
    -~Array~Receipt~ receipts
    -~Cart cart
    
    +getReceipts() Array~Receipt~
    +getName() string
    +getReceipt() string
    +getCart() Cart
}
note for Cashier"
 username must not be empty 
 password must not be empty 
"


 class Receipt{
    -~Cart prchasedCart
    -~Cashier cashier
    -~Temporal timeStamp
    
    + getCart() Cart
    + getCashier() Cashier
    + getTime() Temporal

 }
 note for Receipt"
 timeStamp <= current date and time
 "

 
 
 Cart "1" o--* "*" Product
 Receipt "1" o--o "1" Cart
 Cashier "1" o--o "*" Cart
 Cashier "1" o--o "*" Receipt
 Cart "1" o--o "*" Coupon

```
## Changes since phase 1
* We now have a coupon class which is an interface with two types the BOGO and the 25Percent coupons and also have cashiers who can sign in to process
  checkouts and apply coupons and generate results
* I added a quantity field to my product class to keep track of how much of each product is available
* I added a new type of product frozen yougurt which will be measured in millilitres(ml) typed in when a customer is purchasing that product
* I also added constraints where necessary to indicate uniqueness as well as bidirectional relationships
