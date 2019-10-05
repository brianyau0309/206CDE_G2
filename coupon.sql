CREATE TABLE coupon
(coupon_id CHAR(16) NOT NULL,
 coupon_type VARCHAR(20) NOT NULL,
 discount NUMBER(2,2) NOT NULL);

ALTER TABLE coupon
ADD PRIMARY KEY (coupon_id);

