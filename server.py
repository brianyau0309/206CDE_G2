#encoding=utf-8
# -*- coding: utf-8 -*-  
import os   
os.environ['NLS_LANG'] = 'SIMPLIFIED CHINESE_CHINA.UTF8'   
from flask import Flask, session, request, render_template, jsonify, redirect, url_for
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
    if session.get('table'):
        return render_template("client.html")
    else:
        return redirect(url_for('tableloginpage'))

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
    remark = request.args.get('remark')
    if (food != None):
        condition = " WHERE food = '%s'"%food
    if (remark != None):
        condition = " WHERE remark_id = '%s'"%remark
    
    output = db.exe_fetch(SQL['getFoodRemark'].format(condition=condition), 'all')

    return jsonify({ 'food_remark': output})

@app.route('/api/combo_choice')
def combo_choiceAPI():
    condition = ''
    combo = request.args.get('combo')
    if combo != None:
        condition = "AND a.food_id = '%s'"%combo

    output = db.exe_fetch(SQL['getComboChoice'].format(condition=condition), 'all')

    return jsonify({ 'combo_choice': output })

@app.route('/api/combo_choice_info')
def combo_choice_infoAPI():
    condition = ''
    food = request.args.get('food')
    combo = request.args.get('combo')
    types = request.args.get('types')
    if food != None:
        condition += " AND a.food_id = '%s'"%food
    if combo != None:
        condition += " AND a.combo_id = '%s'"%combo
    if types != None:
        condition += " AND a.types = '%s'"%types
    

    output = db.exe_fetch(SQL['getComboChoiceInfo'].format(condition=condition), 'all')

    return jsonify({ 'combo_choice_info': output })

@app.route('/api/combo_person')
def combo_personAPI():
    condition = ''
    combo = request.args.get('combo')
    if combo != None:
        condition = "and a.combo = '%s'"%combo

    print(SQL['getComboPerson'].format(condition=condition))
    output = db.exe_fetch(SQL['getComboPerson'].format(condition=condition), 'all')

    return jsonify({ 'combo_person': output })

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
    loginInfo=request.json.get('login')
    member_id = loginInfo.get('id')
    password = loginInfo.get('password')
    member_password = db.exe_fetch("SELECT member_password FROM members WHERE member_id = '%s'"%member_id, 'one').get('MEMBER_PASSWORD')
    print(member_id)
    print(password)
    print(member_password)
    if member_password != None:
        if member_password == password:
            session['member'] = member_id
            return jsonify({ 'result': 'Success' })
    return jsonify({'result':'Error'})

@app.route('/tableloginpage') #Login process
@cross_origin()
def tableloginpage():
    return render_template("tableloginpage.html")

@app.route('/tablelogin', methods = ["POST"]) #Login process
@cross_origin()
def tablelogin():
    table = request.form['Table']
    table_id = db.exe_fetch("SELECT table_id FROM table_list WHERE table_id = '%s'"%table, 'one').get('TABLE_ID')
    print(table)
    print(table_id)
    if table_id != None:
        if table == table_id:
            session['table'] = table_id
            return redirect(url_for('client'))
    return jsonify({'result':'Error'})

@app.route('/member_logout', methods = ["post"]) #For Table member logout
@cross_origin()
def member_logout():
    if session.get('member') != None:
        session.pop('member')
        return jsonify({ 'result': 'success' })

    return jsonify({ 'result': 'error' })

@app.route('/QRlogin', methods = ["POST"]) #QRLogin process
@cross_origin()
def QRlogin():
    table = request.form['Table']
    order = request.form['Order']
    order_table = db.exe_fetch("SELECT order_id, table_id from order_table WHERE order_id = '%s' and table_id = '%s'"%(order,table))
    if order_table != None:
        if order == order_table.get('ORDER_ID') and table == order_table.get('TABLE_ID'):
            if request.form['submit'] == 'member':
                member_id = request.form['Member']
                password = request.form['MemberPassword']
                member_password = db.exe_fetch("SELECT member_password FROM members WHERE member_id = '%s'"%member_id, 'one')
                if member_password != None:
                    if member_password[0] == password:
                        session['member'] = member_id
                        session['table'] = table_id
                        return redirect(url_for('client'))
            elif request.form['submit'] == 'nonmember':
                session['member'] = 'guest'
                session['table'] = table
                return redirect(url_for('client'))
    return jsonify({'result':'Error'})

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

@app.route('/QRlogout', methods = ["post"]) #Logout
@cross_origin()
def QRlogout():
    if session.get('table'):
        session.clear()
    return redirect(url_for('loginpage'))

@app.route('/api/session') #session
@cross_origin()
def SESSION():
    table = None
    member = None
    staff = None
    ses = []
    if session.get('table'):
        table = session.get('table')
    if session.get('member'):
        member = session.get('member')
    if session.get('staff'):
        staff = session.get('staff')
    ses.append(table)
    ses.append(member)
    ses.append(staff)
    return jsonify({'table': ses[0],'member':ses[1],'staff':ses[2]})

@app.route('/api/orderid', method['POST']) #get orderid by session
@cross_origin()
def getorderid():
    table = session.get('table')
    orderid = db.exe_fetch("SELECT order_id from order_table where table_id = '%s'"%table)
    return jsonify({'result': orderid})

  
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
        try:
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
        except:
            return jsonify({'result':'error'})
    else:
        return jsonify({'result':'error'})

@app.route('/api/combo_order_food', methods = ["get","post"]) #ordering combo food from the menu
@cross_origin()
def combo_order_food():
    if request.method == 'POST':
        ordering = request.json.get('order_combo')
        order = ordering.get('order')
        combo = ordering.get('combo')
        foods = ordering.get('food')
        try:
            price = db.exe_fetch(SQL['getFoodPrice']%combo).get('FOOD_PRICE')

            combo_sequence = db.exe_fetch(SQL['getSequence']%(order,combo)).get('ORDER_SEQUENCE')
            if combo_sequence == None:
                combo_sequence = 0
            new_combo_sequence = int(combo_sequence) + 1

            db.cursor.execute(SQL['orderFood']%(order,combo,new_combo_sequence,price))

            for i in foods:
                food = i.get('food')
                remark = i.get('remark')
                types = i.get('types')
                price = db.exe_fetch(SQL['getComboFoodPrice']%(combo,food,types)).get('PRICE')

                sequence = db.exe_fetch(SQL['getSequence']%(order,food)).get('ORDER_SEQUENCE')
                if sequence == None:
                    sequence = 0
                sequence += 1
                print(food, remark, types, price, sequence)

                db.cursor.execute(SQL['orderComboFood']%(order,food,sequence,price,combo,new_combo_sequence))
                for j in remark:
                    remark_price = db.exe_fetch(SQL['getRemarkPrice']%j).get('PRICE')
                    db.cursor.execute(SQL['orderRemark']%(order,food,sequence,j,remark_price))
            db.cursor.execute('commit')
            return jsonify({'result':'Success'})
        except:
             return jsonify({'result':'error'})
    else:
        return jsonify({'result':'error'})

@app.route('/api/bill') #show the bill
@cross_origin()
def bill():
    condition1 = ''
    condition2 = ''
    lang = 'eng'
    orderID = request.args.get('orderID')
    if request.args.get('lang'):
        lang = request.args.get('lang')
    if orderID != None:
        condition1 += " AND a.order_id = '%s'"%orderID
        condition2 +=  " AND a.orders = '%s'"%orderID
    else:
        orderID = '00000003'
        condition1 += " AND a.order_id = '00000003'"
        condition2 +=  " AND a.orders = '00000003'"
    output1 =  db.exe_fetch(SQL['getOrders'].format(condition1=condition1),'all')
    bill_food = db.exe_fetch(SQL['getFoodOrdered'].format(condition2=condition2), 'all')

    foods = []
    for food in bill_food:
        
        if food.get('CATEGORY_NAME') == 'combo':
            combo_food = db.exe_fetch(SQL['getComboFoodByPK'].format(combo=food.get('FOOD'),order=food.get('ORDERS'),seq=food.get('ORDER_SEQUENCE')), 'all')
            food['COMBO_FOOD'] = []
            for i in combo_food:
                remark = db.exe_fetch(SQL['getRemarkByPK'].format(food=i.get('FOOD'),order=i.get('ORDERS'),seq=i.get('ORDER_SEQUENCE')), 'all')
                i['REMARK'] = remark
                food['COMBO_FOOD'].append(i)
            foods.append(food)
        else:
            remark = db.exe_fetch(SQL['getRemarkByPK'].format(food=food.get('FOOD'),order=food.get('ORDERS'),seq=food.get('ORDER_SEQUENCE')),'all')
            food['REMARK'] = remark
            foods.append(food)

    output = {'bill': output1, 'food': foods}
    return jsonify(output)

@app.route('/pay', methods = ["post"]) #pay the bill
@cross_origin()
def pay():
    payment = request.json.get('payment')
    orderID = payment.get('orderID')
    method = payment.get('method')
    table = payment.get('table')
    member = payment.get('member')
    try:
        db.cursor.execute(SQL['updatePayment']%(method,orderID))
        db.cursorexecute(SQL['updateOrderState']%(method,orderID))
        db.cursor.execute(SQL['tableAvailable']%table)
        db.cursor.execute(SQL['updateMember']%(member,orderID))
        db.cursor.execute('commit')
        if session.get('member'):
            session.pop('member')
        return jsonify({'result':'success'})
    except:
        return jsonify({'result':'error'})

@app.route('/cancel_food', methods = ["post"]) #cancel the ordered food
@cross_origin()
def cancel_food():
    cancel = request.json.get('cancel')
    orderID = cancel.get('order_id')
    sequence = cancel.get('sequence')
    food = cancel.get('food')
    combo_food = db.exe_fetch(SQL['getComboFood']%(food,orderID,sequence))
    if combo_food !=  None:
        try:
            for i in combo_food:
                food = i.get('FOOD')
                sequence = i.get('ORDER_SEQUENCE')
                remark = db.exe_fetch(SQL['getOrderRemark']%(orderID,sequence,food)).get('REMARK')
                db.cursor.execute(SQL['deleteRemark']%(sequence,orderID,remark,food))
                db.cursor.execute(SQL['deleteOrderFood']%(sequence,orderID,food))
            db.cursor.execute('commit')
            return {'result':'success'}
        except:
            return jsonify({'result': 'error'})
    else:
        try:
            remark = db.exe_fetch(SQL['getOrderRemark']%(orderID,sequence,food)).get(remark)
            db.cursor.execute(SQL['deleteRemark']%(sequence,orderID,remark,food))
            db.cursor.execute(SQL['deleteOrderFood']%(sequence,orderID,food))
            db.cursor.execute('commit')
            return {'result':'success'}
        except:
            return jsonify({'result': 'error'})

@app.route('/finish_cook', methods = ["post"]) #cooked the ordered food
@cross_origin()
def finish_cook():
    cooked = request.json.get('cooked')
    orderID = cooked.get('orderID')
    food = cooked.get('food')
    sequence = cooked.get('sequence')
    db.cursor.execute(SQL['foodCooked']%(orderID,food,sequence))
    db.cursor.execute('commit')
    return jsonify({'result': 'success'})

@app.route('/food_served', methods = ["post"]) #served the ordered food
@cross_origin()
def food_served():
    served = request.json.get('served')
    orderID = served.get('orderID')
    food = served.get('food')
    sequence = served.get('sequence')
    db.cursor.execute(SQL['foodServed']%(orderID,food,sequence))
    db.cursor.execute('commit')
    return jsonify({'result': 'success'})

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
