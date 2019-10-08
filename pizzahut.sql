--  Droping  --
DROP SEQUENCE orders_pk;
DROP SEQUENCE order_food_pk;
DROP SEQUENCE order_remark_pk;
DROP SEQUENCE staff_pk;
DROP SEQUENCE payment_method_pk;
DROP SEQUENCE members_pk;
DROP SEQUENCE membership_pk;
DROP SEQUENCE table_list_pk;
DROP SEQUENCE food_pk;
DROP SEQUENCE category_pk;
DROP TABLE order_food;
DROP TABLE order_remark;
DROP TABLE order_table;
DROP TABLE table_list;
DROP TABLE orders;
DROP TABLE staff;
DROP TABLE payment_method;
DROP TABLE membership;
DROP TABLE members;
DROP TABLE combo_price;
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
  food_id CHAR(3) NOT NULL,
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

-- combo price --
CREATE TABLE combo_price(
  combo_id CHAR(3) NOT NULL,
  food_id CHAR(3) NOT NULL,
  price NUMBER(4,1) NOT NULL
);
-- combo price --

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
  member_tel CHAR(8) NOT NULL,
  membership CHAR(1) NOT NULL,
  member_point NUMBER(8) NOT NULL
);
--  members end  --





--  staff  --
CREATE TABLE staff(
  staff_id CHAR(4) NOT NULL,
  staff_password VARCHAR2(30) NOT NULL,
  staff_surname CHAR(20) NOT NULL,
  staff_lastname CHAR(30) NOT NULL,
  sex CHAR(1) NOT NULL,
  position VARCHAR2(20) NOT NULL
);
--  staff end  --


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
  staff CHAR(4) NOT NULL,
  payment_method CHAR(2) NOT NULL,
  order_state CHAR(6) NOT NULL,
  order_date DATE NOT NULL,
  total_price NUMBER(6,1) NOT NULL
);
--  orders  --

--  table_list  --
CREATE TABLE table_list (
  table_order CHAR(8),
  table_id CHAR(2) NOT NULL,
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
-- order_remark --
CREATE TABLE order_remark(
  remark_id CHAR(3) NOT NULL,
  food CHAR(3) NOT NULL,
  remark VARCHAR(20) NOT NULL
);
-- order_remark end --
--  order_food  --
CREATE TABLE order_food(
 orders CHAR(8) NOT NULL,
 food CHAR(3) NOT NULL,
 order_sequence NUMBER(3) NOT NULL,
 remark CHAR(3) NOT NULL,
 dish_state VARCHAR(20) NOT NULL
);
--  order_food end  --




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

-- combo price --
ALTER TABLE combo_price
ADD PRIMARY KEY (combo_id, food_id);

ALTER TABLE combo_price
ADD FOREIGN KEY (combo_id) 
REFERENCES food(food_id);

ALTER TABLE combo_price
ADD FOREIGN KEY (food_id)
REFERENCES food(food_id); 
-- combo price end --

--  membership  --
ALTER TABLE membership
ADD PRIMARY KEY (membership_id);
--  membership end  --

--  members --
ALTER TABLE members
ADD PRIMARY KEY (member_id);
--  members end  --

--  payment_method  --
ALTER TABLE payment_method
ADD PRIMARY KEY (payment_method_id);
--  payment_method  --

--  staff  --
ALTER TABLE staff
ADD PRIMARY KEY (staff_id);
--  staff end  --


--  orders  --
ALTER TABLE orders
ADD PRIMARY KEY (order_id);

ALTER TABLE orders
ADD FOREIGN KEY (member)
REFERENCES members(member_id);


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

-- order remark --
ALTER TABLE order_remark
ADD PRIMARY KEY (remark_id);

ALTER TABLE order_remark
ADD FOREIGN KEY (food)
REFERENCES food(food_id);
--  order_remark end  --

--  order_food  --
ALTER TABLE order_food
ADD PRIMARY KEY (orders, food, order_sequence);

ALTER TABLE order_food
ADD FOREIGN KEY (orders)
REFERENCES orders(order_id);

ALTER TABLE order_food
ADD FOREIGN KEY (food)
REFERENCES food(food_id);

ALTER TABLE order_food
ADD FOREIGN KEY (remark)
REFERENCES order_remark(remark_id);
--  order_food end --

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

--  order_remark  --
CREATE SEQUENCE order_remark_pk;

CREATE TRIGGER order_remark_pk
BEFORE INSERT ON order_remark
FOR EACH ROW
BEGIN
  SELECT order_remark_pk.NEXTVAL
  INTO   :new.remark_id
  FROM   dual;
END;
/
--  order_remark end  --

--  order_food  --
CREATE SEQUENCE order_food_pk;

CREATE TRIGGER order_food_pk
BEFORE INSERT ON order_food
FOR EACH ROW
BEGIN
  SELECT  COUNT(:old.orders)+1
  INTO   :new.order_sequence
  FROM   order_food;
END;
/
--  order_food end  --

--  Sequences & Trigger end  --