-- Table: category
DROP SEQUENCE food_pk;
DROP TABLE food;
DROP SEQUENCE category_pk;
DROP TABLE category;

CREATE SEQUENCE category_pk;

CREATE TABLE category (
  category_id CHAR(3),
  category_name VARCHAR2(20)
);

ALTER TABLE category
ADD PRIMARY KEY (category_id);

CREATE TRIGGER category_bi
BEFORE INSERT ON category
FOR EACH ROW
BEGIN
  SELECT 'C'||LPAD(category_pk.NEXTVAL,'2','0')
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
-- category end

-- Table food

CREATE SEQUENCE food_pk;

CREATE TABLE food(
  food_id CHAR(3) NOT NULL,
  category CHAR(3) NOT NULL,
  food_eng_name VARCHAR2(50) NOT NULL,
  food_chi_name NVARCHAR2(20) NOT NULL,
  description_eng VARCHAR2(100) NOT NULL,
  description_chi NVARCHAR2(50) NOT NULL,
  food_price NUMBER(4,1) NOT NULL,
  vegetarian CHAR(1) NOT NULL
);

ALTER TABLE food
ADD PRIMARY KEY (food_id);

ALTER TABLE food
ADD FOREIGN KEY (category) 
REFERENCES category(category_id);

CREATE TRIGGER food_id_bi
BEFORE INSERT ON food
FOR EACH ROW
BEGIN
  SELECT 'F'||LPAD(food_pk.NEXTVAL,'2','0')
  INTO   :new.food_id
  FROM   dual;
END;
/

INSERT INTO 
  food (category,food_eng_name,food_chi_name,description_eng,description_chi,food_price,vegetarian)
VALUES
  ('C01','Pizza A','薄餅甲','description_eng for pizza A','薄餅甲薄餅甲薄餅甲',150.5,'Y');
