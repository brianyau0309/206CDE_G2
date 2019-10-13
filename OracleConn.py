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
    self.connection.commit()

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
  '''
}