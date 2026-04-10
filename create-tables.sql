create table if not exists cashier(
    username varchar(255) not null unique,
    password varchar(255) not null
);
create table if not exists cart(
    cart_id serial not null unique,
    total integer not null,
    cashier varchar(255) not null unique,
    current_product varchar(255),
    foreign key (cashier)references cashier(username)
    on delete cascade
);
create table if not exists product(
    quantity integer not null,
    product_type varchar(255) not null,
    name varchar(255) not null unique,
    price integer not null

);
create table if not exists coupon(
     name varchar(255) not null unique,
     description varchar(255) unique
);
create table if not exists receipt(
    timeStamp timestamp not null,
    cart integer not null unique,
    cashier varchar(255) not null,
    foreign key (cashier) references cashier(username)
    on delete cascade,
    foreign key (cart) references cart(cart_id)
    on delete cascade
    );
create table if not exists cartItem(
    product_name varchar(255) not null,
    cart_id integer not null,
    quantity integer not null,
    current_total integer not null,
    foreign key (product_name) references product(name)
    on delete cascade,
    foreign key (cart_id) references cart(cart_id)
    on delete cascade
    );
create table if not exists cartCoupon(
    coupon varchar(255) not null,
    cart_id integer not null,
    foreign key (coupon) references coupon(name)
    on delete cascade,
    foreign key (cart_id) references cart(cart_id)
    on delete cascade
    );
-- insert stock and price of products into store--
--insert into product(quantity,product_type, name, price) values(10, 'Juice','Orange Juice', 5)--
  --  on conflict (name) do nothing;--
--insert into product(quantity,product_type, name, price) values(10, 'Smoothie','Strawberry Sunshine', 6)--
    --on conflict (name) do nothing;--
--insert into product(quantity,product_type, name, price) values(30, 'Frozen Yogurt','Vanilla Froyo', 6)--
    --on conflict (name) do nothing;--
-- insert 10 new items--
insert into product(quantity,product_type, name, price) values(10, 'Juice','Red Sunrise', 5)
    on conflict (name) do nothing;
insert into product(quantity,product_type, name, price) values(10, 'Smoothie','Mango Hurricane', 6)
    on conflict (name) do nothing;
insert into product(quantity,product_type, name, price) values(30, 'Frozen Yogurt','Strawberry Froyo', 6)
    on conflict (name) do nothing;
insert into product(quantity,product_type, name, price) values(10, 'Juice','Apple Juice', 5)
    on conflict (name) do nothing;
insert into product(quantity,product_type, name, price) values(10, 'Smoothie','Ripped Berry', 6)
    on conflict (name) do nothing;
insert into product(quantity,product_type, name, price) values(30, 'Frozen Yogurt','Blueberry Froyo', 6)
    on conflict (name) do nothing;
insert into product(quantity,product_type, name, price) values(10, 'Juice','Maui Juice', 5)
    on conflict (name) do nothing;
insert into product(quantity,product_type, name, price) values(10, 'Smoothie','Pirates Nectar', 6)
    on conflict (name) do nothing;
insert into product(quantity,product_type, name, price) values(30, 'Frozen Yogurt','Mango Froyo', 6)
    on conflict (name) do nothing;
insert into product(quantity,product_type, name, price) values(10, 'Smoothie','Canadian Colada', 6)
    on conflict (name) do nothing;