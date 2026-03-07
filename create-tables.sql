create table if not exists Cashier(
    username varchar(255) not null unique,
    password varchar(255) not null unique
);
create table if not exists Cart(
    cart_number serial not null unique,
    cashier varchar(255) not null,
    foreign key (cashier) references Cashier(password)
    on delete cascade
);
create table if not exists Product(
    name varchar(255) not null unique,
    price integer not null,
    quantity integer not null
);
create table if not exists Coupon(
     name varchar(255) not null unique,
    description varchar(255) unique
);
create table if not exists Receipt(
    timeStamp timeStamp not null,
    cart integer not null unique,
    cashier varchar(255) not null,
    foreign key (cashier) references Cashier(password)
    on delete cascade,
    foreign key (cart) references Cart(cart_number)
    on delete cascade
    );
create table if not exists CartItem(
    product_name varchar(255) not null,
    cart_number integer not null,
    quantity integer not null,
    current_total integer not null,
    foreign key (product_name) references Product(name)
    on delete cascade,
    foreign key (cart_id) references Cart(cart_number)
    on delete cascade
    );
create table if not exists CartCoupon(
    coupon varchar(255) not null,
    cart_number integer not null,
    foreign key (coupon) references Coupon(name)
    on delete cascade,
    foreign key (cart_id) references Cart(cart_id)
    on delete cascade
    );