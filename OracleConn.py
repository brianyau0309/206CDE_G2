print('Oracle Connection')
ip = input('Server Adress: ')
account = input('Account: ')
password = input('Password: ')

import cx_Oracle
conn = cx_Oracle.connect(account + '/' + password + '@' + ip + '/xe')

print('Oracle Version', conn.version)

conn.close;
