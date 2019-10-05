--  Droping
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


--  Table: order_combo_detail
CREATE TABLE order_combo_detail(
  combo_detail_id NUMBER(3) NOT NULL,
  food NUMBER(3) NOT NULL,
  combo_dish_state VARCHAR(10) NOT NULL,
  remark VARCHAR(20) NOT NULL
);

ALTER TABLE order_combo_detail
ADD PRIMARY KEY (combo_detail_id);

ALTER TABLE order_combo_detail
ADD FOREIGN KEY (food)
REFERENCES combo_food(food);

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
(coupon_id CHAR(16) NOT NULL,
 member_id CHAR(8) NOT NULL,
 coupon_state VARCHAR2(10) NOT NULL);

ALTER TABLE member_coupon
ADD PRIMARY KEY (coupon_id);

ALTER TABLE member_coupon
ADD FORIGEN KEY (member_id)
REFERENCES members(member_id);

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
ADD　FORIGEN KEY (member_id)
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