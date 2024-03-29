#encoding=utf-8
# -*- coding: utf-8 -*-  
import os   
os.environ['NLS_LANG'] = 'SIMPLIFIED CHINESE_CHINA.UTF8'   
import cx_Oracle

def rows_to_dict_list(cursor):
  columns = [i[0] for i in cursor.description]
  return [dict(zip(columns, row)) for row in cursor]

class OracleConn():
  def __init__(self):
    loginfile = open("oracleAC.txt")
    data = loginfile.readline()
    data = data.split(',')
    ip = data[0]
    account = data[1]
    password = data[2]
    connect = account + '/' + password + '@' + ip + '/xe'

    self.conn = cx_Oracle.connect(connect)
    print('Oracle Version', self.conn.version)

    self.cursor = self.conn.cursor()

  def exe_fetch(self, SQL, fetch = 'one'):
    self.cursor.execute(SQL)
    if fetch == 'one':
      try:
        out = rows_to_dict_list(self.cursor)[0]
      except:
        out = {}

      return out

    elif fetch == 'all':
      return rows_to_dict_list(self.cursor)

  def exe_commit(self, SQL):
    self.cursor.execute(SQL)
    self.cursor.execute('commit')

  def close(self):
    self.conn.close

SQL = {
  'getFood': '''
  SELECT 
    a.food_id,
    b.category_name,
    a.food_{lang}_name,
    a.description_{lang},
    a.food_price
  FROM 
    food a, category b 
  WHERE 
    a.category = b.category_id and
    a.available = 'Y' and
    b.category_name = '{category}'
  ''',

  'getVegetarianFood': '''
  SELECT 
    a.food_id,
    b.category_name,
    a.food_{lang}_name,
    a.description_{lang},
    a.food_price
  FROM 
    food a, category b 
  WHERE 
    a.category = b.category_id and
    a.available = 'Y' and
    a.vegetarian = 'Y'
  ''',

  'getOrders': '''
  SELECT
    a.order_id,  
    a.member,
    b.staff_surname||' '||b.staff_lastname as staff_name,
    a.order_state,
    a.order_date
  FROM 
    orders a, staff b 
  WHERE
    a.staff = b.staff_id
    {condition1}
  ''',
  
  'getPayment': '''
  SELECT 
    payment_method_id,
    payment_method_name,
    price_rate
  FROM 
    payment_method
  ''',
  
  'getStaff': '''
  SELECT 
    staff_id,
    staff_password,
    staff_surname,
    staff_lastname,
    sex,
    position
  FROM 
    staff
  ''',
  
  'getTable': '''
    SELECT
      b.table_id,
      b.table_sit,
      a.order_id
    FROM
      (SELECT 
        a.*, 
        b.order_id 
      FROM 
        table_list a, 
        order_table b, 
        orders c 
      WHERE 
        a.table_id = b.table_id AND 
        b.order_id = c.order_id AND 
        c.order_state = 'in sit') a
    RIGHT JOIN table_list b ON
      a.table_id = b.table_id
    Order by b.table_id
  ''',

  'getFoodRemark': '''
  SELECT
    *
  From
    food_remark
  {condition}
  ''',

  'getComboChoice': '''
  SELECT
      a.combo, b.food_chi_name, b.food_eng_name, a.food, c.category_name, a.types, a.price
  FROM
      (SELECT
        a.food_id as combo, b.food_id as food, b.types, b.price 
      FROM 
        food a, combo_price b 
      WHERE
        a.food_id = b.combo_id {condition}) a,
        food b, 
        category c
  WHERE
    a.food = b.food_id and
    b.category = c.category_id
  ''',

  'getComboChoiceInfo': '''
  SELECT
    a.food_id,
    b.food_chi_name,
    b.food_eng_name,
    c.category_name,
    a.types,
    a.price
  FROM
    combo_price a, food b, category c
  WHERE
    a.food_id = b.food_id AND
    b.category = c.category_id
    {condition}
    ''',

  'getComboPerson':'''
  SELECT
    b.category_name, 
    a.quantity 
  FROM 
    combo_person a,
    category b 
  WHERE 
    a.category = b.category_id 
    {condition}
  ''',

  'createOrder':'''
  INSERT INTO orders(order_id,staff,order_state,order_date) 
    values(LPAD(orders_pk.NEXTVAL,8,'0'),'S001','in sit',TO_DATE('%s','yyyy/mm/dd hh24:mi:ss'))
  ''',

  'createTable':'''
  INSERT INTO order_table 
    values(LPAD(orders_pk.CURRVAL,8,'0'),'%s')
  ''',

  'getOrderId':'''
  select 
    order_id 
  from 
    (SELECT order_id FROM orders ORDER BY order_date desc) 
  WHERE
    rownum = 1
  ''',

  'getOrderTable': '''
  SELECT
    table_id
  From
    order_table
  {condition}
  ''' ,

  'orderFood':'''
  INSERT INTO order_food
    values('%s','%s',%d,'preparing',%f,NULL,NULL)
  ''',

  'orderRemark':'''
  INSERT INTO order_remark
    values('%s','%s',%d,'%s',%f)
  ''',

  'getFoodPrice':'''
  select 
    food_price 
  from 
    food
  WHERE
    food_id = '%s'
  ''',

  'updatePrice':'''
  UPDATE order_food
    SET price = %f
    where food = '%s'
  ''',

  'getSequence':'''
  SELECT
    MAX(order_sequence) order_sequence
  FROM
    order_food
  WHERE
    orders = '%s' and
    food = '%s'
  ''',

  'updatePayment':'''
  UPDATE orders
    SET payment_method = '%s'
    where order_id = '%s'
  ''',

  'updateOrderState':'''
  UPDATE orders
    SET order_state = 'close'
  WHERE
    order_id = '%s' and 
    order_state = 'in sit'
  '''
  ,

  'getTotalPrice':'''
  select 
    total_price
  from 
    orders
  WHERE
    order_id = '%s'
  ''',

  'tableNotAvailable':'''
  update table_list
    SET table_available = 'N'
    where table_id = '%s'
  ''',

   'tableAvailable':'''
  update table_list
    SET table_available = 'Y'
    where table_id = '%s'
  ''',

  'getOrderRemark':'''
  select 
    remark
  from 
    order_remark
  WHERE
    order_id = '%s' and order_sequence = %d and food = '%s'
  ''',

  'getRemarkPrice':'''
  select 
    price
  from 
    food_remark
  WHERE
    remark_id = '%s'
  ''',

  'getComboPrice':'''
  select 
    price
  from 
    combo_price
  WHERE
    food = '%s'
  ''',

  'getPrice':'''
  select 
    food_price
  from 
    food
  WHERE
    food_id = '%s'
  ''',

  'deleteRemark':'''
  delete from order_remark
  where order_sequence = %d
  and orders = '%s'
  and remark = '%s'
  and food = '%s'
  ''',

  'deleteOrderFood':'''
  delete from order_food
  where order_sequence = %d
  and orders ='%s'
  and food = '%s'
  ''',

  'getComboFood':'''
  SELECT food , order_sequence 
  from order_food 
  where combo = '%s' 
  and orders = '%s' 
  and combo_sequence = %d
  ''',

  'foodCooked':'''
  update order_food
  set dish_state = 'cooked'
  where orders = '%s' and food = '%s' and order_sequence = %d
  ''',

  'foodServed':'''
  UPDATE order_food
    SET dish_state = 'served'
  WHERE 
    orders = '%s' and 
    food = '%s' and 
    order_sequence = %d
  ''',
  
  'getComboFoodPrice':'''
  select price
  from combo_price
  where combo_id = '%s'
  and food_id = '%s'
  and types = '%s'
  ''',

  'orderComboFood':'''
  INSERT INTO order_food
    values('%s','%s',%d,'preparing',%f,'%s',%d)
    ''',

  'getFoodOrdered':'''
  SELECT 
    a.*,
    b.food_eng_name,
    b.food_chi_name,
    c.category_name
  FROM 
    order_food a,
    food b,
    category c
  WHERE
    a.food = b.food_id and 
    c.category_id = b.category and 
    a.combo is NULL
    {condition2}
  ''',

  'getComboFoodByPK':'''
  SELECT
    a.*,
    b.food_eng_name,
    b.food_chi_name,
    c.category_name
  FROM
    order_food a,
    food b,
    category c
  WHERE
    a.food = b.food_id and
    b.category = c.category_id and
    a.orders = '{order}' and
    a.combo = '{combo}' and 
    a.combo_sequence = {seq}
  ''',

  'getRemarkByPK':'''
  SELECT
    a.remark as remark_id,
    b.option_eng||' '||b.remark_eng as remark_eng,
    b.option_chi||b.remark_chi as remark_chi,
    a.remark_price
  FROM
    order_remark a,
    food_remark b
  WHERE
    a.remark = b.remark_id and
    a.orders = '{order}' and
    a.food = '{food}' and
    a.order_sequence = {seq}
  ''',

  'getCookList':'''
  SELECT 
    a.*, b.food_chi_name
  FROM 
    order_food a, food b, orders c
  WHERE 
    a.food = b.food_id and
    a.orders = c.order_id and 
    a.dish_state = 'preparing' and
    c.order_state = 'in sit' and 
    b.category != 'C1'
  '''
}
