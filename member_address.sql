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