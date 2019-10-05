--  Droping
DROP TABLE staff_salary;
DROP TABLE staff_address;
DROP TABLE staff;
DROP SEQUENCE staff_pk;
DROP TABLE payment_method;
DROP SEQUENCE payment_method_pk;
DROP TABLE order_table;
DROP TABLE table_list;
DROP SEQUENCE table_list_pk;
DROP TABLE combo_food;
DROP SEQUENCE combo_pk;
DROP TABLE combo;
DROP SEQUENCE food_pk;
DROP TABLE food;
DROP SEQUENCE category_pk;
DROP TABLE category;
DROP SEQUENCE combo_detail_pk;
DROP TABLE order_combo_detail;
DROP TABLE coupon;
DROP TABLE members;
DROP TABLE member_coupon;
DROP TABLE membership;
DROP TABLE member_address;
DROP TABLE orders;
DROP SEQUENCE orders_pk;
DROP SEQUENCE order_combo_pk;
DROP SEQUENCE order_food_pk;
DROP TABLE order_combo;
DROP TABLE order_food;
--  Droping end

--  Table: category
CREATE TABLE category (
  category_id NUMBER(2) NOT NULL,
  category_name VARCHAR2(20) NOT NULL
);

ALTER TABLE category
ADD PRIMARY KEY (category_id);

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

INSERT INTO category (category_name) VALUES ('Pizza');
INSERT INTO category (category_name) VALUES ('Rice');
INSERT INTO category (category_name) VALUES ('Pasta');
INSERT INTO category (category_name) VALUES ('Starter');
INSERT INTO category (category_name) VALUES ('Drink');
INSERT INTO category (category_name) VALUES ('Dessert');
--  category end

--  Table food
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

ALTER TABLE food
ADD PRIMARY KEY (food_id);

ALTER TABLE food
ADD FOREIGN KEY (category) 
REFERENCES category(category_id);

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

INSERT INTO food 
  (category,food_eng_name,food_chi_name,description_eng,description_chi,food_price,vegetarian,provide)
VALUES
  (1,'Pizza A','薄餅甲','description_eng for pizza A','薄餅甲薄餅甲薄餅甲',150.5,'N','Y');
--  food end

--  Table: combo
CREATE TABLE combo(
  combo_id NUMBER(3) NOT NULL,
  combo_name_eng VARCHAR2(50) NOT NULL,
  combo_name_chi NVARCHAR2(20) NOT NULL,
  description_eng VARCHAR2(100) NOT NULL,
  description_chi NVARCHAR2(50) NOT NULL,
  combo_price NUMBER(5,1) NOT NULL,
  provide CHAR(1) NOT NULL
);

ALTER TABLE combo
ADD PRIMARY KEY (combo_id);

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

INSERT INTO combo 
  (combo_name_eng,combo_name_chi,description_eng,description_chi,combo_price,provide)
VALUES
  ('Combo A','套餐甲','description_eng for Combo A','套餐甲 套餐甲 套餐甲',399.9,'Y');
--  combo end

--  Table: combo_food
CREATE TABLE combo_food(
  combo NUMBER(3) NOT NULL,
  food NUMBER(3) NOT NULL,
  product_type CHAR(7) NOT NULL,
  combo_product_price NUMBER(3,1) NOT NULL,
  provide CHAR(1) NOT NULL
);

ALTER TABLE combo_food
ADD PRIMARY KEY (combo,food,product_type);

ALTER TABLE combo_food
ADD FOREIGN KEY (combo) 
REFERENCES combo(combo_id);

ALTER TABLE combo_food
ADD FOREIGN KEY (food) 
REFERENCES food(food_id);

INSERT INTO combo_food
VALUES (1,1,'default',0,'Y');

INSERT INTO combo_food
VALUES (1,1,'upgrade',15,'Y');

INSERT INTO combo_food
VALUES (1,1,'bonus',40,'N');
--  combo_product end




--Table:coupon

CREATE TABLE coupon
(coupon_id CHAR(16) NOT NULL,
 coupon_type VARCHAR(20) NOT NULL,
 discount NUMBER(2,2) NOT NULL);

ALTER TABLE coupon
ADD PRIMARY KEY (coupon_id);

-- coupon end

--Table:members

CREATE TABLE members
(member_id CHAR(8) NOT NULL,
 member_password VARCHAR2 (30) NOT NULL,
 birthday DATE NOT NULL,
 member_surname VARCHAR2(30) NOT NULL,
 member_lastname VARCHAR2(30) NOT NULL,
 sex CHAR(1) NOT NULL,
 member_tel CHAR(8) NOT NULL);
 
ALTER TABLE members
ADD PRIMARY KEY (member_id);

-- members end

--Table:member_coupon
CREATE TABLE member_coupon
(coupon CHAR(16) NOT NULL,
 member_id CHAR(8) NOT NULL,
 coupon_state VARCHAR2(10) NOT NULL);

ALTER TABLE member_coupon
ADD PRIMARY KEY (coupon);

ALTER TABLE member_coupon
ADD FOREIGN KEY (member_id)
REFERENCES members(member_id);

ALTER TABLE member_coupon
ADD FOREIGN KEY (coupon)
REFERENCE coupon(coupon_id);

-- member_coupon end

--Table: membership
CREATE TABLE membership
(card_id NUMBER(8) NOT NULL,
 member_id CHAR(8) NOT NULL,
 member_point NUMBER(8) NOT NULL,
 card_type VARCHAR(20) NOT NULL, 
 discount NUMBER(3,2) NOT NULL);

ALTER TABLE membership
ADD PRIMARY KEY (card_id);

ALTER TABLE membership
ADD　FOREIGN KEY (member_id)
REFERENCES members(member_id);

-- membership end

--Table member_address

CREATE TABLE member_address(
  members CHAR(8) NOT NULL,
  flat VARCHAR2(20) NOT NULL,
  building VARCHAR2(30) NOT NULL,
  street VARCHAR2(30) NOT NULL,
  distrit VARCHAR2(20) NOT NULL
);

ALTER TABLE member_address
ADD PRIMARY KEY (members);

ALTER TABLE member_address
ADD FOREIGN KEY (members)
REFERENCES members(member_id);

--member_address end


-- Table: payment_method
CREATE TABLE payment_method(
  payment_method_id CHAR(2) NOT NULL,
  payment_method_name VARCHAR2(30) NOT NULL,
  price_rate NUMBER(3) NOT NULL
);

ALTER TABLE payment_method
ADD PRIMARY KEY (payment_method_id);

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

INSERT INTO payment_method
  (payment_method_name,price_rate)
VALUES  
  ('Cash', 100);

INSERT INTO payment_method
  (payment_method_name,price_rate)
VALUES  
  ('Credit Card A', 95);

INSERT INTO payment_method
  (payment_method_name,price_rate)
VALUES  
  ('Credit Card B', 90);
--  payment_method end

--  Table: staff
CREATE TABLE staff(
  staff_id CHAR(4) NOT NULL,
  staff_password VARCHAR2(30) NOT NULL,
  staff_surname CHAR(20) NOT NULL,
  staff_lastname CHAR(30) NOT NULL,
  sex CHAR(1) NOT NULL,
  birthday DATE NOT NULL,
  position VARCHAR2(20) NOT NULL,
  staff_tel CHAR(8) NOT NULL
);

ALTER TABLE staff
ADD PRIMARY KEY (staff_id);

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
--  staff end

--  Table: staff_address
CREATE TABLE staff_address(
  staff CHAR(4) NOT NULL,
  flat VARCHAR2(20) NOT NULL,
  building VARCHAR2(30) NOT NULL,
  street VARCHAR2(30) NOT NULL,
  distrit VARCHAR2(20) NOT NULL
);

ALTER TABLE staff_address
ADD PRIMARY KEY (staff);

ALTER TABLE staff_address 
ADD FOREIGN KEY (staff)
REFERENCES staff(staff_id);
--  staff_address end

--  Table: staff_salary
CREATE TABLE staff_salary(
  staff CHAR(4) NOT NULL,
  salary_type CHAR(5) NOT NULL,
  salary NUMBER(6,1) NOT NULL,
  work_hour NUMBER(4,1) NOT NULL,
  dates date NOT NULL
);

ALTER TABLE staff_salary
ADD PRIMARY KEY (staff);

ALTER TABLE staff_salary
ADD FOREIGN KEY (staff)
REFERENCES staff(staff_id);
--  staff_salary end

-- Table: orders

CREATE TABLE orders(
 order_id CHAR(8) NOT NULL,
 member_id CHAR(8) NOT NULL,
 total_price NUMBER(7,1) NOT NULL,
 order_state VARCHAR(20) NOT NULL,
 dates DATE NOT NULL,
 staff_id CHAR(4) NOT NULL
);

ALTER TABLE orders
ADD PRIMARY KEY (order_id);

ALTER TABLE orders
ADD FOREIGN KEY (member_id)
REFERENCES members(member_id);

ALTER TABLE orders
ADD FOREIGN KEY (staff_id)
REFERENCES staff(staff_id);

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
-- orders end

--  Table: table_list
CREATE TABLE table_list (
  table_id CHAR(2) NOT NULL,
  table_password CHAR(30) NOT NULL,
  table_available CHAR(1) NOT NULL,
  table_sit NUMBER(2) NOT NULL,
  orders CHAR(8),
  table_start DATE
);

ALTER TABLE table_list
ADD PRIMARY KEY (table_id);

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

INSERT INTO table_list
  (table_password,table_available, table_sit)
VALUES
  ('table1pw','Y', 4);

INSERT INTO table_list
  (table_password,table_available, table_sit)
VALUES
  ('table2pw','Y', 8);

INSERT INTO table_list
  (table_password,table_available, table_sit)
VALUES
  ('table3pw','Y', 12);
--  table_list end

--  Table: table_order
CREATE TABLE order_table(
  order_id CHAR(8) NOT NULL,
  table_id CHAR(2) NOT NULL
);

ALTER TABLE order_table
ADD PRIMARY KEY (order_id, table_id);

ALTER TABLE order_table
ADD FOREIGN KEY (table_id) 
REFERENCES table_list(table_id);

ALTER TABLE order_table
ADD FOREIGN KEY (order_id) 
REFERENCES orders(order_id);

-- table_order end

-- Table: order_food

CREATE TABLE order_food(
 order_food_id CHAR(8) NOT NULL,
 food CHAR(8) NOT NULL,
 dish_state VARCHAR(20) NOT NULL,
 orders CHAR(8) NOT NULL
);

ALTER TABLE order_food
ADD PRIMARY KEY (order_food_id);

ALTER TABLE order_food
ADD FOREIGN KEY (food)
REFERENCES food(food_id);

ALTER TABLE order_food
ADD FOREIGN KEY (orders)
REFERENCES orders(order_id);

CREATE SEQUENCE order_food_pk;

CREATE TRIGGER order_food_pk
BEFORE INSERT ON staff
FOR EACH ROW
BEGIN
  SELECT order_food_pk.NEXTVAL
  INTO   :new.order_food_id
  FROM   dual;
END;
/

-- order_food end

-- Table: order_combo

CREATE TABLE order_combo(
 order_combo_id CHAR(8) NOT NULL,
 combo NUMBER(3) NOT NULL,
 orders CHAR(8) NOT NULL);

ALTER TABLE order_combo
ADD PRIMARY KEY (order_combo_id);

ALTER TABLE order_combo
ADD FOREIGN KEY (orders)
REFERENCES orders(order_id);

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
-- order_combo end

--  Table: order_combo_detail

CREATE TABLE order_combo_detail(
  combo_detail_id NUMBER(8) NOT NULL,
  food NUMBER(3) NOT NULL,
  combo_dish_state VARCHAR(10) NOT NULL,
  remark VARCHAR(20) NOT NULL,
  order_combo CHAR(8) NOT NULL);

ALTER TABLE order_combo_detail
ADD PRIMARY KEY (combo_detail_id);

ALTER TABLE order_combo_detail
ADD FOREIGN KEY (food)
REFERENCES combo_food(food);

ALTER TABLE order_combo_detail
ADD FOREIGN KEY (order_combo)
REFERENCES oreder_combo(order_combo_id);

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
-- order_combo_detail end