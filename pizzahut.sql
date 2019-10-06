--  Droping  --
DROP SEQUENCE orders_pk;
DROP SEQUENCE order_combo_pk;
DROP SEQUENCE order_food_pk;
DROP SEQUENCE staff_pk;
DROP SEQUENCE payment_method_pk;
DROP SEQUENCE members_pk;
DROP SEQUENCE membership_pk;
DROP SEQUENCE member_coupon_pk;
DROP SEQUENCE coupon_pk;
DROP SEQUENCE table_list_pk;
DROP SEQUENCE combo_pk;
DROP SEQUENCE food_pk;
DROP SEQUENCE category_pk;
DROP SEQUENCE combo_detail_pk;
DROP SEQUENCE combo_food_pk;
DROP TABLE order_combo_detail;
DROP TABLE order_combo;
DROP TABLE order_food;
DROP TABLE order_table;
DROP TABLE table_list;
DROP TABLE orders;
DROP TABLE staff_salary;
DROP TABLE staff;
DROP TABLE payment_method;
DROP TABLE membership;
DROP TABLE member_coupon;
DROP TABLE members;
DROP TABLE coupon;
DROP TABLE combo_food;
DROP TABLE combo;
DROP TABLE food;
DROP TABLE category;
--  Droping end  --

--  Table  --

--  category  --
CREATE TABLE category (
  category_id NUMBER(2) NOT NULL,
  category_name VARCHAR2(20) NOT NULL
);
--  category end  --

--  food  --
CREATE TABLE food(
  food_id NUMBER(3) NOT NULL,
  category NUMBER(2) NOT NULL,
  food_eng_name VARCHAR2(50) NOT NULL,
  food_chi_name NVARCHAR2(20) NOT NULL,
  description_eng VARCHAR2(100) NOT NULL,
  description_chi NVARCHAR2(50) NOT NULL,
  food_price NUMBER(4,1) NOT NULL,
  vegetarian CHAR(1) NOT NULL,
  provide CHAR(1) NOT NULL
);
--  food end  --

--  combo  --
CREATE TABLE combo(
  combo_id NUMBER(3) NOT NULL,
  combo_name_eng VARCHAR2(50) NOT NULL,
  combo_name_chi NVARCHAR2(20) NOT NULL,
  description_eng VARCHAR2(100) NOT NULL,
  description_chi NVARCHAR2(50) NOT NULL,
  combo_price NUMBER(5,1) NOT NULL,
  provide CHAR(1) NOT NULL
);
--  combo end  --

--  combo_food  --
CREATE TABLE combo_food(
  combo_food_id CHAR(3) NOT NULL,
  combo NUMBER(3) NOT NULL,
  food NUMBER(3) NOT NULL,
  product_type CHAR(7) NOT NULL,
  combo_product_price NUMBER(3,1) NOT NULL,
  provide CHAR(1) NOT NULL
);
--  combo_food end  --

--  membership  --
CREATE TABLE membership(
  membership_id CHAR(1) NOT NULL,
  membership_name VARCHAR2(10) NOT NULL,
  discount NUMBER(3,2) NOT NULL
);
--  membership end  --

--  members  --
CREATE TABLE members(
  member_id CHAR(8) NOT NULL,
  member_password VARCHAR2 (30) NOT NULL,
  member_surname VARCHAR2(30) NOT NULL,
  member_lastname VARCHAR2(30) NOT NULL,
  sex CHAR(1) NOT NULL,
  birthday DATE NOT NULL,
  address_flat VARCHAR2(20) NOT NULL,
  address_building VARCHAR2(30) NOT NULL,
  address_street VARCHAR2(30) NOT NULL,
  address_district VARCHAR2(20) NOT NULL,
  member_tel CHAR(8) NOT NULL,
  membership CHAR(1) NOT NULL,
  member_point NUMBER(8) NOT NULL
);
--  members end  --

--  coupon  --
CREATE TABLE coupon(
  coupon_id CHAR(16) NOT NULL,
  coupon_name VARCHAR(20) NOT NULL,
  discount NUMBER(3) NOT NULL
);
--  coupon end  --

--  member_coupon  --
CREATE TABLE member_coupon(
  member_coupon_id CHAR(8) NOT NULL,
  member_id CHAR(8) NOT NULL,
  coupon CHAR(16) NOT NULL,
  coupon_state VARCHAR2(10) NOT NULL
);
--  member_coupon end  --

--  staff  --
CREATE TABLE staff(
  staff_id CHAR(4) NOT NULL,
  staff_password VARCHAR2(30) NOT NULL,
  staff_surname CHAR(20) NOT NULL,
  staff_lastname CHAR(30) NOT NULL,
  sex CHAR(1) NOT NULL,
  birthday DATE NOT NULL,
  address_flat VARCHAR2(20) NOT NULL,
  address_building VARCHAR2(30) NOT NULL,
  address_street VARCHAR2(30) NOT NULL,
  address_district VARCHAR2(20) NOT NULL,
  position VARCHAR2(20) NOT NULL,
  staff_tel CHAR(8) NOT NULL
);
--  staff end  --

--  staff_salary  --
CREATE TABLE staff_salary(
  staff CHAR(4) NOT NULL,
  salary_date date NOT NULL,
  salary_type CHAR(5) NOT NULL,
  salary NUMBER(6,1) NOT NULL,
  work_hour NUMBER(4,1) NOT NULL
);
--  staff_salary end  --

--  payment_method  --
CREATE TABLE payment_method(
  payment_method_id CHAR(2) NOT NULL,
  payment_method_name VARCHAR2(30) NOT NULL,
  price_rate NUMBER(3) NOT NULL
);
--  payment_method end  --

--  orders  --
CREATE TABLE orders(
  order_id CHAR(8) NOT NULL,
  member CHAR(8),
  coupon CHAR(8),
  staff CHAR(4) NOT NULL,
  payment_method CHAR(2) NOT NULL,
  order_state CHAR(6) NOT NULL,
  order_date DATE NOT NULL
);
--  orders  --

--  table_list  --
CREATE TABLE table_list (
  table_order CHAR(8),
  table_id CHAR(2) NOT NULL,
  table_password CHAR(30) NOT NULL,
  table_available CHAR(1) NOT NULL,
  table_sit NUMBER(2) NOT NULL,
  table_start DATE
);
--  table_list end  --

--  order_table  --
CREATE TABLE order_table(
  order_id CHAR(8) NOT NULL,
  table_id CHAR(2) NOT NULL
);
--  order_table end  --

--  order_food  --
CREATE TABLE order_food(
 order_food_id CHAR(8) NOT NULL,
 orders CHAR(8) NOT NULL,
 food NUMBER(3) NOT NULL,
 remark VARCHAR2(20),
 dish_state VARCHAR(20) NOT NULL
);
--  order_food end  --

--  order_combo  --
CREATE TABLE order_combo(
 order_combo_id CHAR(8) NOT NULL,
 combo NUMBER(3) NOT NULL,
 orders CHAR(8) NOT NULL
);
--  order_combo end  --

--  order_combo_detail  --
CREATE TABLE order_combo_detail(
  combo_detail_id NUMBER(8) NOT NULL,
  order_combo CHAR(8) NOT NULL,
  combo_food CHAR(3) NOT NULL,
  remark VARCHAR2(20),
  combo_dish_state VARCHAR2(10) NOT NULL
);
--  order_combo_detail end  --

--  Table end  --

--  Primary Key & Foreign key  --

--  category  --
ALTER TABLE category
ADD PRIMARY KEY (category_id);
--  category end  --

--  food  --
ALTER TABLE food
ADD PRIMARY KEY (food_id);

ALTER TABLE food
ADD FOREIGN KEY (category) 
REFERENCES category(category_id);
--  food end  --

--  combo  -- 
ALTER TABLE combo
ADD PRIMARY KEY (combo_id);
--  combo end  --

--  combo_food  --
ALTER TABLE combo_food
ADD PRIMARY KEY (combo_food_id);

ALTER TABLE combo_food
ADD FOREIGN KEY (combo) 
REFERENCES combo(combo_id);

ALTER TABLE combo_food
ADD FOREIGN KEY (food) 
REFERENCES food(food_id);
--  combo_food end  --

--  membership  --
ALTER TABLE membership
ADD PRIMARY KEY (membership_id);
--  membership end  --

--  members --
ALTER TABLE members
ADD PRIMARY KEY (member_id);
--  members end  --

--  coupon  --
ALTER TABLE coupon
ADD PRIMARY KEY (coupon_id);
--  coupon end  --

--  member_coupon  --
ALTER TABLE member_coupon
ADD PRIMARY KEY (member_coupon_id);

ALTER TABLE member_coupon
ADD FOREIGN KEY (member_id)
REFERENCES members(member_id);

ALTER TABLE member_coupon
ADD FOREIGN KEY (coupon)
REFERENCES coupon(coupon_id);
--  member_coupon end  --

--  payment_method  --
ALTER TABLE payment_method
ADD PRIMARY KEY (payment_method_id);
--  payment_method  --

--  staff  --
ALTER TABLE staff
ADD PRIMARY KEY (staff_id);
--  staff end  --

--  staff_salary  --
ALTER TABLE staff_salary
ADD PRIMARY KEY (staff, salary_date);

ALTER TABLE staff_salary
ADD FOREIGN KEY (staff)
REFERENCES staff(staff_id);
--  staff_salary end  --

--  orders  --
ALTER TABLE orders
ADD PRIMARY KEY (order_id);

ALTER TABLE orders
ADD FOREIGN KEY (member)
REFERENCES members(member_id);

ALTER TABLE orders
ADD FOREIGN KEY (coupon)
REFERENCES member_coupon(member_coupon_id);

ALTER TABLE orders
ADD FOREIGN KEY (staff)
REFERENCES staff(staff_id);

ALTER TABLE orders
ADD FOREIGN KEY (payment_method)
REFERENCES payment_method(payment_method_id);
--  orders end  --

--  table_list  --
ALTER TABLE table_list
ADD PRIMARY KEY (table_id);

ALTER TABLE table_list
ADD FOREIGN KEY (table_order)
REFERENCES orders(order_id);
--  table_list end  --

--  order_table  --
ALTER TABLE order_table
ADD PRIMARY KEY (order_id, table_id);

ALTER TABLE order_table
ADD FOREIGN KEY (table_id) 
REFERENCES table_list(table_id);

ALTER TABLE order_table
ADD FOREIGN KEY (order_id) 
REFERENCES orders(order_id);
--  order_table end  --

--  order_food  --
ALTER TABLE order_food
ADD PRIMARY KEY (order_food_id);

ALTER TABLE order_food
ADD FOREIGN KEY (orders)
REFERENCES orders(order_id);

ALTER TABLE order_food
ADD FOREIGN KEY (food)
REFERENCES food(food_id);
--  order_food end --

--  order_combo  --
ALTER TABLE order_combo
ADD PRIMARY KEY (order_combo_id);

ALTER TABLE order_combo
ADD FOREIGN KEY (orders)
REFERENCES orders(order_id);

ALTER TABLE order_combo
ADD FOREIGN KEY (combo)
REFERENCES combo(combo_id);
--  order_combo end  --

--  order_combo_detail  --
ALTER TABLE order_combo_detail
ADD PRIMARY KEY (combo_detail_id);

ALTER TABLE order_combo_detail
ADD FOREIGN KEY (order_combo)
REFERENCES order_combo(order_combo_id);

ALTER TABLE order_combo_detail
ADD FOREIGN KEY (combo_food)
REFERENCES combo_food(combo_food_id);
--  order_combo_detail end  --

--  Primary Key & Foreign key end  --

--  Sequences & Trigger  --

--  category --
CREATE SEQUENCE category_pk;

CREATE TRIGGER category_bi
BEFORE INSERT ON category
FOR EACH ROW
BEGIN
  SELECT category_pk.NEXTVAL
  INTO   :new.category_id
  FROM   dual;
END;
/
--  category  --

--  food  --
CREATE SEQUENCE food_pk;

CREATE TRIGGER food_id_bi
BEFORE INSERT ON food
FOR EACH ROW
BEGIN
  SELECT food_pk.NEXTVAL
  INTO   :new.food_id
  FROM   dual;
END;
/
--  food end  --

--  combo  --
CREATE SEQUENCE combo_pk;

CREATE TRIGGER combo_bi
BEFORE INSERT ON combo
FOR EACH ROW
BEGIN
  SELECT combo_pk.NEXTVAL
  INTO   :new.combo_id
  FROM   dual;
END;
/
--  combo end  --

--  combo_food  --
CREATE SEQUENCE combo_food_pk;

CREATE TRIGGER combo_food_bi
BEFORE INSERT ON combo_food
FOR EACH ROW
BEGIN
  SELECT combo_food_pk.NEXTVAL
  INTO   :new.combo_food_id
  FROM   dual;
END;
/
--  combo_food end  --

--  membership  --
CREATE SEQUENCE membership_pk;

CREATE TRIGGER membership_bi
BEFORE INSERT ON membership
FOR EACH ROW
BEGIN
  SELECT membership_pk.NEXTVAL
  INTO   :new.membership_id
  FROM   dual;
END;
/
--  membership end  --

--  members  --
CREATE SEQUENCE members_pk;

CREATE TRIGGER members_bi
BEFORE INSERT ON members
FOR EACH ROW
BEGIN
  SELECT members_pk.NEXTVAL
  INTO   :new.member_id
  FROM   dual;
END;
/
--  members end  --

--  coupon  --
CREATE SEQUENCE coupon_pk;

CREATE TRIGGER coupon_bi
BEFORE INSERT ON coupon
FOR EACH ROW
BEGIN
  SELECT coupon_pk.NEXTVAL
  INTO   :new.coupon_id
  FROM   dual;
END;
/
--  coupon end  --

--  member_coupon  --
CREATE SEQUENCE member_coupon_pk;

CREATE TRIGGER member_coupon_bi
BEFORE INSERT ON member_coupon
FOR EACH ROW
BEGIN
  SELECT member_coupon_pk.NEXTVAL
  INTO   :new.member_coupon_id
  FROM   dual;
END;
/
--  member_coupon end  --

--  staff  --
CREATE SEQUENCE staff_pk;

CREATE TRIGGER staff_pk
BEFORE INSERT ON staff
FOR EACH ROW
BEGIN
  SELECT staff_pk.NEXTVAL
  INTO   :new.staff_id
  FROM   dual;
END;
/
--  staff end  --

--  payment_method  --
CREATE SEQUENCE payment_method_pk;

CREATE TRIGGER payment_method_bi
BEFORE INSERT ON payment_method
FOR EACH ROW
BEGIN
  SELECT payment_method_pk.NEXTVAL
  INTO   :new.payment_method_id
  FROM   dual;
END;
/
--  payment_method end  --

--  orders  --
CREATE SEQUENCE orders_pk;

CREATE TRIGGER orders_pk
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
  SELECT orders_pk.NEXTVAL
  INTO   :new.order_id
  FROM   dual;
END;
/
--  orders  --

--  table_list  --
CREATE SEQUENCE table_list_pk;

CREATE TRIGGER table_list_bi
BEFORE INSERT ON table_list
FOR EACH ROW
BEGIN
  SELECT table_list_pk.NEXTVAL
  INTO   :new.table_id
  FROM   dual;
END;
/
--  table_list end  --

--  order_food  --
CREATE SEQUENCE order_food_pk;

CREATE TRIGGER order_food_pk
BEFORE INSERT ON order_food
FOR EACH ROW
BEGIN
  SELECT order_food_pk.NEXTVAL
  INTO   :new.order_food_id
  FROM   dual;
END;
/
--  order_food end  --

--  order_combo  --
CREATE SEQUENCE order_combo_pk;

CREATE TRIGGER order_combo_pk
BEFORE INSERT ON order_combo
FOR EACH ROW
BEGIN
  SELECT order_combo_pk.NEXTVAL
  INTO   :new.order_combo_id
  FROM   dual;
END;
/
--  order_combo end  --

--  order_combo_detail  --
CREATE SEQUENCE combo_detail_pk;

CREATE TRIGGER combo_detail_bi
BEFORE INSERT ON order_combo_detail
FOR EACH ROW
BEGIN
  SELECT combo_detail_pk.NEXTVAL
  INTO   :new.combo_detail_id
  FROM   dual;
END;
/
--  order_combo_detail end  --

--  Sequences & Trigger end  --
