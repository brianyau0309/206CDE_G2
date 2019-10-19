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
    print('Oracle Connection')
    ip = input('Server Adress: ')
    account = input('Account: ')
    password = input('Password: ')

    self.conn = cx_Oracle.connect(account + '/' + password + '@' + ip + '/xe')
    print('Oracle Version', self.conn.version)

    self.cursor = self.conn.cursor()

  def exe_fetch(self, SQL, fetch = 'one'):
    self.cursor.execute(SQL)
    if fetch == 'one':
      return rows_to_dict_list(self.cursor)[0]
    elif fetch == 'all':
      return rows_to_dict_list(self.cursor)

  def exe_commit(self, SQL):
    self.cursor.execute(SQL)
    self.cursor.execute('commit')

  def close(self):
    self.conn.close;

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
    a.order_date,
    a.total_price
  FROM 
    orders a, staff b 
  WHERE
    a.staff = b.staff_id
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
    table_id,
    table_available,
    table_sit
  FROM 
    table_list
  ''',

  'getFoodRemark': '''
  SELECT
    *
  From
    food_remark
  {condition}
  ''',

  'getComboPrice': '''
  SELECT
    *
   FROM
    combo_price
  {condition}
  ''',

  'createOrder':'''
  INSERT INTO orders(order_id,staff,order_state,order_date,total_price) 
    values(LPAD(orders_pk.NEXTVAL,8,'0'),'S001','in sit',TO_DATE('%s','yyyy/mm/dd hh24:mi:ss'),0)
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
    *
  From
    order_table
  {condition}
  ''' ,

  'orderFood':'''
  INSERT INTO order_food
    values('%s','%s',%d,'preparing')
  ''',

  'orderRemark':'''
  INSERT INTO order_remark
    values('%s','%s',%d,'%s')
  ''',

  'getFoodPrice':'''
  select 
    food_price 
  from 
    food
  WHERE
    food_id = '%s'
  ''',

  'updateTotalPrice':'''
  UPDATE orders
    SET total_price = %f
    where order_id = '%s'
  ''',

  'getSequence':'''
  select 
    order_sequence 
  from 
    (SELECT order_sequence FROM order_food ORDER BY desc)
  WHERE
    orders = '%s' & rownum = 1
  ''',

  'updatePayment':'''
  UPDATE orders
    SET payment_method = %d
    where order_id = '%s'
  ''',

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
    *
  from 
    order_remark
  WHERE
    order_id = '%s' & order_sequence = %d
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
    price
  from 
    food
  WHERE
    food_id = '%s'
  ''',

  'cancelDishState':'''
  update order_food
  set dish_state = 'cancel'
  where orders = '%s' & order_sequence = %d
  ''',

  'foodCooked':'''
  update order_food
  set dish_state = '='cooked'
  where orders = '%s' & food = '%s' & order_sequence = %d
  ''',

  'foodServed':'''
  update order_food
  set dish_state = '='served'
  where orders = '%s' & food = '%s' & order_sequence = %d
  '''
}
