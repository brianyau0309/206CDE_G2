--  Droping
DROP TABLE combo_product;
DROP SEQUENCE combo_pk;
DROP TABLE combo;
DROP SEQUENCE food_pk;
DROP TABLE food;
DROP SEQUENCE category_pk;
DROP TABLE category;
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

--  Table: combo_product
CREATE TABLE combo_product(
  combo NUMBER(3) NOT NULL,
  food NUMBER(3) NOT NULL,
  product_type CHAR(7) NOT NULL,
  combo_product_price NUMBER(3,1) NOT NULL,
  provide CHAR(1) NOT NULL
);

ALTER TABLE combo_product
ADD PRIMARY KEY (combo,food,product_type);

ALTER TABLE combo_product
ADD FOREIGN KEY (combo) 
REFERENCES combo(combo_id);

ALTER TABLE combo_product
ADD FOREIGN KEY (food) 
REFERENCES food(food_id);

INSERT INTO combo_product 
VALUES (1,1,'default',0,'Y');

INSERT INTO combo_product 
VALUES (1,1,'upgrade',15,'Y');

INSERT INTO combo_product 
VALUES (1,1,'bonus',40,'N');
--  combo_product end
