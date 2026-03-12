create table if not exists cashier(
    username varchar(255) not null unique,
    password varchar(255) not null unique
);
create table if not exists cart(
    cart_id serial not null unique,
    cashier varchar(255) not null,
    foreign key (cashier) references cashier(username)
    on delete cascade
);
create table if not exists product(
    quantity integer not null,
    name varchar(255) not null unique,
    price integer not null

);
create table if not exists coupon(
     name varchar(255) not null unique,
     description varchar(255) unique
);
create table if not exists receipt(
    timeStamp timeStamp not null,
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