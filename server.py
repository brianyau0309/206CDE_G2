#encoding=utf-8
# -*- coding: utf-8 -*-  
import os   
os.environ['NLS_LANG'] = 'SIMPLIFIED CHINESE_CHINA.UTF8'   
from flask import Flask, session, request, render_template, jsonify
from flask_cors import cross_origin
from OracleConn import OracleConn, SQL
from flask_socketio import SocketIO, send
from datetime import datetime

db = OracleConn()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'SecretKeyHERE!'
app.config['JSON_AS_ASCII'] = False

socketio = SocketIO(app)

@app.route('/')
def hello():
    return render_template("index.html")

@app.route('/client/', defaults={'path': ''})
@app.route('/client/<path:path>')
def client(path):
    return render_template("client.html")

@app.route('/staff/', defaults={'path': ''})
@app.route('/staff/<path:path>')
def staff(path):
    return render_template("staff.html")
    
#API
@app.route('/api/food/<path:category>')
def foodAPI(category):
    lang = 'eng'
    if request.args.get('lang'):
        lang = request.args.get('lang')
        
    if category == 'vegetarian':
        output = db.exe_fetch(SQL['getVegetarianFood'].format(lang=lang), 'all')
    else:
        output = db.exe_fetch(SQL['getFood'].format(category=category,lang=lang), 'all')

    return jsonify({ 'food': output })

@app.route('/api/orders')
def ordersAPI():
    output = db.exe_fetch(SQL['getOrders'], 'all')
    
    return jsonify({ 'order': output })

@app.route('/api/payment')
def paymentAPI():
    output = db.exe_fetch(SQL['getPayment'], 'all')

    return jsonify({'payment': output})

@app.route('/api/staff')
def staffAPI():
    output = db.exe_fetch(SQL['getStaff'], 'all')

    return jsonify({'staff': output})

@app.route('/api/table')
def tableAPI():
    output = db.exe_fetch(SQL['getTable'])
    
    return jsonify({'table': output})

@app.route('/api/food')
def allFoodAPI():
    condition = ''
    food = request.args.get('food')
    if food != None:
        condition = "WHERE food_id = '%s'"%food
    output = db.exe_fetch("SELECT * FROM food {condition}".format(condition=condition), 'all')
    return jsonify({ 'food': output })

@app.route('/api/food_remark')
def food_remarkAPI():
    condition = ''
    food = request.args.get('food')
    if (food != None):
        condition = "WHERE food = '%s'"%food
    output = db.exe_fetch(SQL['getFoodRemark'].format(condition=condition), 'all')

    return jsonify({ 'food_remark': output})

@app.route('/api/combo_price')
def combo_priceAPI():
    condition = ''
    combo = request.args.get('combo')
    food = request.args.get('food')
    if (combo != None and food != None):
        condition = "WHERE combo_id = '%s' and food_id = '%s'"%(combo,food)
    print(SQL['getComboPrice'].format(condition=condition))
    output = db.exe_fetch(SQL['getComboPrice'].format(condition=condition), 'all')

    return jsonify({ 'food_remark': output})

@app.route('/api/lastid')
def lastid():
    lastid = db.exe_fetch('select order_id from (SELECT order_id FROM orders ORDER BY order_date desc) WHERE rownum = 1')
    return jsonify({'lastid': lastid.get('ORDER_ID')})
# API end

@app.route('/loginpage')
@cross_origin()
def loginpage():
    return render_template("loginpage.html")

@app.route('/login', methods = ["post"]) #Login process
@cross_origin()
def login():
    user = session.get('clientID')
    print(user)
    session['clientID'] = 'Test_ID'
    return jsonify({'login': 'success'})

@app.route('/myinfo', methods = ["post"]) #Login process
@cross_origin()
def myinfo():
    user = session.get('clientID')
    print(user, 'checking his information')
    return jsonify({'member_id': user})

@app.route('/create_order') #create invoice
@cross_origin()
def create_order():
    order_date = datetime.now().strftime('%Y/%m/%d %H:%M:%S')
    print(SQL['createOrder']%order_date)
    try:
        db.cursor.execute(SQL['createOrder']%order_date)
        last_id = db.exe_fetch(SQL['getOrderId'])
        print(str(last_id.get('ORDER_ID')))
        db.cursor.execute(SQL['createTable']%last_id)
        db.cursor.execute('commit')
        return { 'result': 'Success' } 
    except:
        return { 'result': 'Error' }
    
@app.route('/order_food', methods = ["post"]) #ordering food from the menu
@cross_origin()
def order_food():
    orderID = request.form.get('orderID')
    food = request.form.get('food')
    food_chose = []
    food_chose.append(food)
    count_sequence = 0
    for i in food_chose:
        try:
            count_sequence +=1
            db.cursor.execute(SQL['orderFood']%(orderID,str(i),count_sequence))
        except:
            break
            return { 'result': 'Error' }
    db.cursor.execute('commit')
    return { 'result': 'Success' }
#socket
@socketio.on('message')
def handleMessage(msg):
    print('Message: ', msg)
    send(msg, broadcast=True)
#socketio

if __name__ == '__main__':
    ip = input('IP: ')
    if ip == '':
        ip = '127.0.0.1'
    socketio.run(app, debug = True, host=ip, port=5000)
