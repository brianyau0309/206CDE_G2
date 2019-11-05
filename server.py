#encoding=utf-8
# -*- coding: utf-8 -*-  
import os   
os.environ['NLS_LANG'] = 'SIMPLIFIED CHINESE_CHINA.UTF8'   
from flask import Flask, session, request, render_template, jsonify, redirect, url_for
from flask_cors import cross_origin
from OracleConn import OracleConn, SQL
from flask_socketio import SocketIO, send, join_room, leave_room, emit
from datetime import datetime

db = OracleConn()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'SecretKeyHERE!'
app.config['JSON_AS_ASCII'] = False

socketio = SocketIO(app)

#testing

@app.route('/chi_test', methods=["POST"])
def test_chi():
    data = request.form['input']
    print(data.encode('utf-8'))
    db.exe_commit("insert into test_chi values (5, '%s')"%data)
    return jsonify({ 'result': data })

@app.route('/test_sk1')
def test_sk1():
    return render_template("test_socketio1.html")

@app.route('/test_sk2')
def test_sk2():
    return render_template("test_socketio2.html")

#testing end

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
    if session.get('staff'):
        return render_template("staff.html")
    else:
        return redirect(url_for('staffloginpage'))
    
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
    output = db.exe_fetch(SQL['getTable'], 'all')
    
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

@app.route('/api/whoami', methods=['POST'])
def whoami():
    user_type = session.get('type')
    if user_type != None:
        if user_type == 'table':
            table = session.get('table')
            member = session.get('member')
            order = db.exe_fetch("SELECT a.order_id, a.order_state FROM orders a, order_table b WHERE a.order_id = b.orders and b.table = '%s'"%table)
        elif user_type == 'member':
            member = session.get('member')
        elif user_type == 'staff':
            staff = session.get('staff')
    else:
        return jsonify({'result': 'Error'})

# API end

@app.route('/loginpage')
@cross_origin()
def loginpage():
    return render_template("loginpage.html")

@app.route('/login', methods = ["POST"]) #Login process
@cross_origin()
def user_login():
    loginInfo = request.json.get('login')
    db.cursor.execute("SELECT member_password FROM members WHERE member_id = '%s'"%loginInfo.get('id'))
    member_password = db.cursor.fetchone()
    
    if member_password != None:
        if member_password[0] == loginInfo.get('password'):
            session['member'] = loginInfo.get('id')
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

@app.route('/staffloginpage')
@cross_origin()
def staffloginpage():
    return render_template("staffloginpage.html")

@app.route('/stafflogin', methods = ["post"])
@cross_origin()
def stafflogin():
    staff = request.form['Staff']
    password = request.form['Password']
    staffInfo = db.exe_fetch("SELECT * FROM staff WHERE staff_id ='%s' and staff_password = '%s'"%(staff,password))
    if staffInfo != None:
        session['staff'] = staffInfo.get('STAFF_ID')
        return redirect(url_for('staff'))
    return jsonify({'result':'Error'})

@app.route('/stafflogout', methods = ["post"]) #For staff logout
@cross_origin()
def stafflogout():
    if session.get('staff') != None:
        session.pop('staff')
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

@app.route('/table_login', methods = ["POST"]) # Table Login process
@cross_origin()
def table_login():
    loginInfo = request.json.get('login')
    table_find = exe_fetch("SELECT * FROM table_list WHERE table_id = '%s'"%login.get('table'))
    if len(table_find) > 0:
        session["type"] = 'table'
        session["table"] = login.get('table')

@app.route('/table_logout', methods = ["POST"]) # Table Login process
@cross_origin()
def table_logout():
    if session.get('table'):
        session.clear()
    return redirect(url_for('client'))

@app.route('/myinfo', methods = ["post"])
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

@app.route('/api/orderid', methods=['POST']) #get orderid by session
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
    print(table)
    try:
        db.cursor.execute(SQL['createOrder']%order_date)
        for i in table:
            print(SQL['createTable']%i)
            print(SQL['tableNotAvailable']%i)
            db.cursor.execute(SQL['createTable']%i)
            db.cursor.execute(SQL['tableNotAvailable']%i)
        db.cursor.execute('commit')
        return { 'result': 'success' } 
    except:
        return { 'result': 'error' }
    
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
        print(not orderID)
        if not orderID:
            orderID = '00000003'
        condition1 += " AND a.order_id = '%s'"%orderID
        condition2 +=  " AND a.orders = '%s'"%orderID
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

    total = 0
    for i in foods:
        total += i.get('PRICE')
        if i.get('COMBO_FOOD'):
            for j in i.get('COMBO_FOOD'):
                total += j.get('PRICE')
                for k in j.get('REMARK'):
                    total += k.get('REMARK_PRICE')
        if i.get('REMARK'):
            for j in i.get('REMARK'):
                total += j.get('REMARK_PRICE')
    
    output1[0]['TOTAL_PRICE'] = total
    output = {'bill': output1, 'food': foods}

    return jsonify(output)

@app.route('/pay', methods = ["post"]) #pay the bill
@cross_origin()
def pay():
    payment = request.json.get('payment')
    orderID = payment.get('orderID')
    method = payment.get('method')
    member = payment.get('member')
    try:
        db.cursor.execute(SQL['updatePayment']%(method,orderID))
        db.cursor.execute(SQL['updateOrderState']%(orderID))
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
    flag = True
    print(orderID, food, sequence)
    try:
        db.cursor.execute(SQL['deleteOrderFood']%(sequence,orderID,food))
    except:
        flag = False

    if flag:
        db.cursor.execute('commit')
        return jsonify({'result': 'success'})
    
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

    try:
        db.cursor.execute(SQL['foodServed']%(orderID,food,sequence))
        db.cursor.execute('commit')
    except:
        return jsonify({'result': 'erroe'})

    return jsonify({'result': 'success'})

#socket
@socketio.on('message')
def handleMessage(msg):
    print('Message: ', msg)
    send(msg, broadcast=True)

@socketio.on('topay')
def topaymessage(data):
    print('topaymessage: ')
    emit('topay','Please wait for the staff come', room=data)
    emit('topay',data + ' is waiting to pay',room='staff')


@socketio.on('addRoom')
def on_join(data):
    room = data['room']
    join_room(room)
    print('addRoom: ',room)
    send('some one has join ' + room,room=room)

@socketio.on('leaveRoom')
def on_leave(data):
    room = data['room']
    leave_room(room)
    print('leave: ',room)
    send('some one has leave ' + room,room=room)
#socketio

if __name__ == '__main__':
    ip = input('IP: ')
    if ip == '':
        ip = '127.0.0.1'
    socketio.run(app, debug = True, host=ip, port=5000)
