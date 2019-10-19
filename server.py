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

@app.route('/create_order', methods = ["post"]) #create invoice
@cross_origin()
def create_order():
    order_date = datetime.now().strftime('%Y/%m/%d %H:%M:%S')
    print(SQL['createOrder']%order_date)
    table = request.json.get('table')
    try:
        db.cursor.execute(SQL['createOrder']%order_date)
        db.cursor.execute(SQL['createTable']%table)
        db.cursor.execute(SQL['tableNotAvailable']%table)
        db.cursor.execute('commit')
        return { 'result': 'Success' } 
    except:
        return { 'result': 'Error' }
    
@app.route('api/order_food', methods = ["get","post"]) #ordering food from the menu
@cross_origin()
def order_food():
    if request.method == 'GET':
        return { 'result': 'None' } 
    elif request.method == 'POST':
        ordering = request.json.get('order_food')
        orderID = ordering.get('order_id')
        food = ordering.get('food')
        remark = ordering.get('remark')
        remark_price = ordering.get('remark_price')
        combo_price = ordering.get('combo_price')
        price = ordering.get('price')
        curr_total_price = db.exe_fetch(SQL['getTotalPrice']%orderID).get(order_id)
        total_remark_price = 0
        for i in remark_price:
            total_remark_price += i
        total_price = total_remark_price + combo_price + price + curr_total_price
        print(ordering)
        try:
            sequence = db.exe_fetch(SQL['getSequence']%orderID, 'one').get(order_sequence)
        except:
            pass
            sequence = 0
        db.cursor.execute(SQL['orderFood']%(orderID,food,int(sequence)+1))
        for i in remark:
            db.cursor.execute(SQL['orderRemark']%(orderID,food,int(sequence+1),i))
        db.cursor.execute(SQL['updateTotalPrice']%(total_price,orderID))
        db.cursor.execute('commit')
        return jsonify({'ordering': ordering})

@app.route('/pay', methods = ["post"]) #pay the bill
@cross_origin()
def pay():
    payment = request.json.get('payment')
    orderID = payment.get('orderID')
    method = payment.get('method')
    table = payment.get('table')
    db.execute(SQL['updatePayment']%(method,orderID))
    db.execute(SQL['updateOrderState']%(method,orderID))
    db.execute(SQL['tableAvailable']%table)
    db.execute('commit')
    return jsonify({'payment': payment})

@app.route('/cancel_food', methods = ["post"]) #cancel the ordered food
@cross_origin()
def cancel_food():
    cancel = request.json.get('cancel')
    orderID = cancel.get('order_id')
    sequence = cancel.get('sequence')
    try:
        food = db.exe_fetch(SQL['getOrderRemark']%(orderID,sequence)).get(food)
        remark = db.exe_fetch(SQL['getOrderRemark']%(orderID,sequence)).get(remark)
        remark_price = db.exe_fetch(SQL['getRemarkPrice']%remark, 'all').get(price)
        combo_price = db.exe_fetch(SQL['getComboPrice']%food).get(price)
        price = db.exe_fetch(SQL['getPrice']%food).get(price)
        curr_total_price = db.exe_fetch(SQL['getTotalPrice']%orderID).get(order_id)
        total_remark_price = 0
        for i in remark_price:
            total_remark_price += i
        total_price = curr_total_price - (total_remark_price + combo_price + price)
        db.cursor.execute(SQL['updateTotalPrice']%(total_price_orderID))
        db.cursor.execute(SQL['cancelDishState']%(orderID,sequence))
        db.cursor.execute('commit')
        return jsonify({'cancel': cancel})

@app.route('/finish_cook', methods = ["post"]) #cooked the ordered food
@cross_origin()
def finish_cook():
    cooked = request.json.get('cooked')
    orderID = cooked.get('orderID')
    food = cooked.get('food')
    sequence = cooked.get('sequence')
    db.execute(SQL['foodCooked']%(orderID,food,sequence))
    db.execute('commit')
    return jsonify({'cooked': cooked})

@app.route('/food_served', methods = ["post"]) #served the ordered food
@cross_origin()
def food_served():
    served = request.json.get('served')
    orderID = served.get('orderID')
    food = served.get('food')
    sequence = served.get('sequence')
    db.execute(SQL['foodServed']%(orderID,food,sequence))
    db.execute('commit')
    return jsonify({'served': served})

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
