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

@app.route('/api/combo_choice')
def combo_choiceAPI():
    condition = ''
    combo = request.args.get('combo')
    if combo != None:
        condition = "and a.food_id = '%s'"%combo
    output = db.exe_fetch(SQL['getComboChoice'].format(condition=condition), 'all')

    return jsonify({ 'combo_choice': output })

@app.route('/api/order_table')
def order_table():
    condition = ''
    order = request.args.get('order')
    if (order != None): 
        condition = "WHERE order_id = '%s'"%order
    
    print(SQL['getOrderTable'].format(condition=condition))
    output = db.exe_fetch(SQL['getOrderTable'].format(condition=condition))
    
    return jsonify({ 'order_table': output })
# API end

@app.route('/loginpage')
@cross_origin()
def loginpage():
    return render_template("loginpage.html")

@app.route('/login', methods = ["POST"]) #Login process
@cross_origin()
def login():
    loginInfo = request.json.get('login')
    db.cursor.execute("SELECT member_password FROM members WHERE member_id = '%s'"%loginInfo.get('id'))
    member_password = db.cursor.fetchone()
    
    if member_password != None:
        if member_password[0] == loginInfo.get('password'):
            session['member'] = loginInfo.get('id')
            return jsonify({ 'result': 'Success' })
        
    return jsonify({ 'result': 'Fail'})

@app.route('/myinfo', methods = ["post"]) #Login process
@cross_origin()
def myinfo():
    user = session.get('member')
    print(user, 'checking his information')

    if user != None:
        userInfo = db.exe_fetch("SELECT * FROM members WHERE member_id = '%s'"%user)
        print(userInfo)
        return jsonify({'result': userInfo})
    
    return jsonify({ 'result': 'Fail'})

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
    
@app.route('/api/order_food', methods = ["get","post"]) #ordering food from the menu
@cross_origin()
def order_food():
    if request.method == 'POST':
        ordering = request.json.get('new_order')
        orderID = ordering.get('order')
        food = ordering.get('food')
        remark = ordering.get('remark')
        price = db.exe_fetch(SQL['getPrice']%food).get('FOOD_PRICE')
        print(ordering)
        sequence = db.exe_fetch(SQL['getSequence']%(orderID,food)).get('ORDER_SEQUENCE')
        print(sequence)
        if sequence == None:
            sequence = 0
        new_sequence = int(sequence) + 1
        db.cursor.execute(SQL['orderFood']%(orderID,food,new_sequence,price))
        for i in remark:
            remark_price = db.exe_fetch(SQL['getRemarkPrice']%i).get('PRICE')
            print(remark_price)
            db.cursor.execute(SQL['orderRemark']%(orderID,food,new_sequence,i,remark_price))
        db.cursor.execute('commit')
        return jsonify({'result':'Success'})
    else:
        return jsonify({'result':'error'})

@app.route('/api/combo_order_food', methods = ["get","post"]) #ordering combo food from the menu
@cross_origin()
def combo_order_food():
    if request.method == 'POST':
        combo_ordering = request.json.get('combo_order')
        combo = combo_ordering.get('combo')
        orderID = combo_ordering.get('order')
        foods = combo_ordering.get('food')
        combo_price = db.exe_fetch(SQL['getComboOrderPrice'])
        print(ordering)
        combo_sequence = db.exe_fetch(SQL['getSequence']%(orderID,combo)).get('ORDER_SEQUENCE')
        print(sequence)
        if combo_sequence == None:
            combo_sequence = 0
        new_combo_sequence = int(combo_sequence) + 1
        db.cursor.execute(SQL['orderFood']%(orderID,combo,new_combo_sequence,price))
        for i in foods:
            food = i.get('food')
            remark = i.get('remark')
            types = i.get('types')
            price = db.exe_fetch(SQL['getComboFoodPrice']%(combo,food,types)).get('PRICE')
            sequence = db.exe_fetch(SQL['getSequence']%(orderID,food)).get('ORDER_SEQUENCE')
            if sequence == None:
                sequence = 0
            sequence += 1
            db.cursor.execute(SQL['orderComboFood']%(orderID,food,sequence,price,combo,new_combo_sequence))
            for j in remark:
                remark_price = db.exe_fetch(SQL['getRemarkPrice']%j).get('PRICE')
                print(remark_price)
                db.cursor.execute(SQL['orderRemark']%(orderID,food,new_sequence,j,remark_price))
        db.cursor.execute('commit')
        return jsonify({'result':'Success'})
    else:
        return jsonify({'result':'error'})

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
        db.cursor.execute(SQL['deleteRemark']%(sequence,orderID,remark))
        db.cursor.execute(SQL['deleteOrderFood']%(sequence,orderID,food))
        db.cursor.execute('commit')
        return {'result':'success'}
    except:
        pass

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
