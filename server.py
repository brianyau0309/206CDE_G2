#encoding=utf-8
# -*- coding: utf-8 -*-  
import os   
os.environ['NLS_LANG'] = 'SIMPLIFIED CHINESE_CHINA.UTF8'   
from flask import Flask, session, request, render_template, jsonify, redirect, url_for, send_file
from flask_cors import cross_origin
from OracleConn import OracleConn, SQL
from flask_socketio import SocketIO, send, join_room, leave_room, emit
from datetime import datetime
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.getcwd() + '/static' + '/image' + '/food'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
db = OracleConn()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'SecretKeyHERE!'
app.config['JSON_AS_ASCII'] = False
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

socketio = SocketIO(app)

@app.route('/sw.js') # path to service worker
def sw():
    return send_file(os.path.join(os.path.dirname(__file__),"\\static\\sw.js"))

@app.route('/')
def hello():
    return render_template("index.html")

@app.route('/client/', defaults={'path': ''}) # client page
@app.route('/client/<path:path>')
def client(path):
    if session.get('table') or session.get('QR'):
        return render_template("client.html")
    else:
        return redirect(url_for('tableloginpage'))

@app.route('/staff/', defaults={'path': ''}) # staff page
@app.route('/staff/<path:path>')
def staff(path):
    if session.get('staff'):
        return render_template("staff.html")
    else:
        return redirect(url_for('staffloginpage'))

@app.route('/kitchen', methods=['GET']) # kitchen page
def kitchen():
    if session.get('type') == 'kitchen':
        return render_template("kitchen.html")
    
    return redirect(url_for('kitchenloginpage'))

#API

@app.route('/api/food/<path:category>') # get food by category
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

@app.route('/api/payment') # get all payment methods
def paymentAPI():
    output = db.exe_fetch(SQL['getPayment'], 'all')

    return jsonify({'payment': output})

@app.route('/api/staff') # get staff list
def staffAPI():
    output = db.exe_fetch(SQL['getStaff'], 'all')

    return jsonify({'staff': output})

@app.route('/api/table') # get table list and status
def tableAPI():
    output = db.exe_fetch(SQL['getTable'], 'all')
    
    return jsonify({'table': output})

@app.route('/api/food') # get food by id
def allFoodAPI():
    condition = ''
    food = request.args.get('food')
    if food != None:
        condition = "WHERE food_id = '%s'"%food
    
    output = db.exe_fetch("SELECT * FROM food {condition}".format(condition=condition), 'all')
    
    return jsonify({ 'food': output })

@app.route('/api/food_remark') # get the remark of food
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

@app.route('/api/combo_choice') # get foods can choice in a combo
def combo_choiceAPI():
    condition = ''
    combo = request.args.get('combo')
    if combo != None:
        condition = "AND a.food_id = '%s'"%combo

    output = db.exe_fetch(SQL['getComboChoice'].format(condition=condition), 'all')

    return jsonify({ 'combo_choice': output })

@app.route('/api/combo_choice_info') # get detail info of the combo choice
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

@app.route('/api/combo_person') # get food max. qty in a combo
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
    
    output = db.exe_fetch(SQL['getOrderTable'].format(condition=condition),'all')
    
    return jsonify({ 'order_table': output })

@app.route('/api/whoami', methods=['POST'])
def whoami():
    if session.get('table'):
        table = session.get('table')   
        order = db.exe_fetch("SELECT a.order_id, a.order_state FROM orders a, order_table b WHERE a.order_id = b.order_id and b.table_id = '%s' and a.order_state = 'in sit'"%table)
        return jsonify({ 'order': order })
    return jsonify({'result': 'Error'})

@app.route('/api/cook_list', methods=['GET'])
def cook_list():
    cook_list = db.exe_fetch(SQL['getCookList'], 'all')
    for food in cook_list:
        remark = db.exe_fetch(SQL['getRemarkByPK'].format(food=food.get('FOOD'),order=food.get('ORDERS'),seq=food.get('ORDER_SEQUENCE')), 'all')
        food['REMARK'] = remark

    return jsonify({'cook_list': cook_list})

# API end



@app.route('/loginpage')
@cross_origin()
def loginpage():
    return render_template("loginpage.html")

@app.route('/login', methods = ["POST"]) #Login process for members
@cross_origin()
def user_login():
    loginInfo = request.json.get('login')
    db.cursor.execute("SELECT member_password FROM members WHERE member_id = '%s'"%loginInfo.get('id'))
    member_password = db.fetchone()
    
    if member_password != None:
        if member_password[0] == loginInfo.get('password'):
            session['member'] = loginInfo.get('id')
            return jsonify({ 'result': 'Success' })

    return jsonify({'result':'Error'})

@app.route('/tableloginpage') #Login page for table
@cross_origin()
def tableloginpage():
    return render_template("tableloginpage.html")

@app.route('/tablelogin', methods = ["POST"]) #Login process for table
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

    return jsonify({ 'result': 'success' })

@app.route('/staffloginpage') #Login page for staff
@cross_origin()
def staffloginpage():
    return render_template("staffloginpage.html")

@app.route('/stafflogin', methods = ["post"]) # Login process of staff
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
        return redirect(url_for('staff'))
    return jsonify({'result':'Error'})

@app.route('/QRlogin', methods = ["POST"]) #QRLogin process
@cross_origin()
def QRlogin():
    order = request.form['Order']
    order_table = db.exe_fetch(SQL['getTable'],'all')
    if order_table != None:
        for i in order_table:
            if order == i.get('ORDER_ID'):
                session['table'] = i.get('TABLE_ID')
                session['QR'] = 'yes'
                return redirect(url_for('client'))
                break
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

@app.route('/kitchenloginpage')
@cross_origin()
def kitchenloginpage():
    return render_template("kitchenloginpage.html")

@app.route('/kitchen_login', methods = ["POST"]) # Table Login process
@cross_origin()
def kitchen_login():
    loginInfo = request.form.get('kitchen')
    if loginInfo == 'kitchen':
        session["type"] = 'kitchen'

    return redirect(url_for('kitchen'))

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
    if session.get('QR'):
        session.clear()
    return redirect(url_for('loginpage'))

@app.route('/api/session') #session
@cross_origin()
def SESSION():
    table = None
    member = None
    staff = None
    QR = None
    ses = []
    if session.get('table'):
        table = session.get('table')
    if session.get('member'):
        member = session.get('member')
    if session.get('staff'):
        staff = session.get('staff')
    if session.get('QR'):
        QR = session.get('QR')
    ses.append(table)
    ses.append(member)
    ses.append(staff)
    ses.append(QR) 
    return jsonify({'table': ses[0],'member':ses[1],'staff':ses[2], 'QR':ses[3]})

@app.route('/api/orderid', methods=['POST']) #get order id by session
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
            socketio.emit('created_order',{'room':i})
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
            condition = "WHERE order_id = '%s'"%orderID
            table = db.exe_fetch(SQL['getOrderTable'].format(condition=condition),'all')
            for j in table:
                socketio.emit('reloadbill',{'room':j.get('TABLE_ID')})
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
            condition = "WHERE order_id = '%s'"%order
            table = db.exe_fetch(SQL['getOrderTable'].format(condition=condition),'all')
            for k in table:
                socketio.emit('reloadbill',{'room':k.get('TABLE_ID')})
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
       return jsonify({'result':'error'})
    output1 = db.exe_fetch(SQL['getOrders'].format(condition1=condition1),'all')
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
        condition = "WHERE order_id = '%s'"%orderID
        table = db.exe_fetch(SQL['getOrderTable'].format(condition=condition),'all')
        for i in table:
            socketio.emit('reloadbill',{'room':i.get('TABLE_ID')})
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
    socketio.emit('staffmessage',orderID + '\'s'+ food +' cooked', room='staff')
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
        condition = "WHERE order_id = '%s'"%orderID
        table = db.exe_fetch(SQL['getOrderTable'].format(condition=condition),'all')
        for i in table:
            socketio.emit('reloadbill',{'room':i.get('TABLE_ID')})
    except:
        return jsonify({'result': 'error'})

    return jsonify({'result': 'success'})



# Socket

@socketio.on('message') # for testing
def handleMessage(msg):
    print('Message: ', msg)
    send(msg, broadcast=True)

@socketio.on('topay')
def topaymessage(data):
    print('topaymessage: ')
    emit('topay','Please wait for the staff come', room=data)
    emit('staffmessage',data + ' is waiting to pay',room='staff')

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

@socketio.on('receivePayment')
def receivePayment(data):
    print('receivePayment: ',data)
    emit('receivePayment','Payment has received', room=data.get('TABLE_ID'))
    emit('staffmessage',data.get('TABLE_ID') + '\'s Payment has received',room='staff')

@socketio.on('created_order')
def created_order(data):
    print('Created Order: ',data)
    emit('created_order','welcome pizza-hat', room=data)
    emit('staffmessage',data + ' orders is created',room='staff')

@socketio.on('reloadbill')
def reloadbill(data):
    print('reloadbill: ',data)
    emit('reloadbill','reloadbill', room=data)
    emit('reloadbill','reloadbill', room='kitchen')

@socketio.on('cooked')
def cooked(data):
    order = data['order']
    food = data['food']
    room = data['room']
    print('cooked: ' + order + food + room)
    emit('staffmessage',order + '\'s'+ food +' cooked', room=room)

# Socket Edn

# Admin

@app.route("/admin_index")
def admin_index():
    if session.get('admin'):
        return render_template("admin_index.html")
    else:
        return render_template("admin_login.html")

@app.route("/admin_food")
def admin_food():
    sql = "select food_id, food_eng_name, food_chi_name,food_price,available from food"
    result = db.exe_fetch(sql,'all')
    return render_template("food.html", result = result)

@app.route("/admin_combo")
def admin_combo():
    sql = "select COMBO_ID, FOOD_ID, TYPES, PRICE from combo_price"
    result = db.exe_fetch(sql,'all')
    print(type(result))
    sql2 = "select COMBO, PERSON, CATEGORY, QUANTITY from combo_person"
    result2 = db.exe_fetch(sql2,'all')
    return render_template("combo.html", result = result, result2 = result2)

@app.route("/admin_order")
def admin_order():
    sql = "select ORDER_ID, MEMBER, STAFF, PAYMENT_METHOD, ORDER_STATE, ORDER_DATE from orders"
    result = db.exe_fetch(sql,'all')
    return render_template("order.html", result = result)
    

@app.route("/admin_update", methods=['GET', 'POST'])
def admin_update():
    if 'fid' in request.args:
        foodid = request.args['fid']
        sql1 = "select food_id, food_eng_name, food_chi_name,food_price,available from food"
        result = db.exe_fetch(sql,'all')

    if request.method == "POST":
        food_id = request.form['id']
        engname = request.form['name']
        cname = request.form['cname']
        price = request.form['price']
        print(food_id)
        print(engname)
        print(cname)
        sql = "update food SET food_eng_name = '{0}', food_chi_name = '{1}',food_price = {2} where food_id ='{3}'"
        execute(sql.format(engname, cname, price, food_id))
        execute('commit')
        return redirect(url_for("admin_food"))

    return render_template("update.html",foodid = foodid,result=result)
    

@app.route("/admin_delete", methods=['GET','POST'])
def admin_delete():
    if 'fid' in request.args:
        foodid = request.args['fid']
        db.exe_fetch("SELECT available from food where food_id ='%s'"%foodid,'one')
        available = db.exe_fetch("SELECT available from food where food_id ='%s'"%foodid,'one')
        if available[0] == 'Y':
            sql = "update food set available = 'N' where food_id = '{0}'".format(foodid)
            execute(sql)
            execute('commit')
        if available[0] == 'N':
            sql = "update food set available = 'Y' where food_id = '{0}'".format(foodid)
            execute(sql)
            execute('commit')

@app.route("/admin_add", methods=['POST'])
def admin_add():
    food_id = request.form['ID']
    food_Catecory = request.form['Catecory']
    food_Eng_name = request.form['Eng_name']
    food_Chi_name = request.form['Chi_name']
    food_Disscription_Eng = request.form['Disscription_Eng']
    food_Disscription_Chi = request.form['Disscription_Chi']
    food_Price = request.form['Price']
    print(food_Chi_name)
    food_Vegetarian = request.form['Vegetarian']
    sql = "insert into food values('{0}', '{1}', '{2}', '{3}', '{4}', '{5}', {6}, '{7}', 'Y')"
    execute(sql.format(food_id, food_Catecory, food_Eng_name, '一', food_Disscription_Eng, '一', food_Price, food_Vegetarian))
    execute('commit')
    return redirect(url_for("food"))

@app.route("/admin_loginpage")
def admin_loginpage():
    return render_template("admin_login.html")

@app.route("/admin_login", methods=['POST'])
def admin_login():
    staff_id = request.form['staff_id']
    password = request.form['password']
    sql = "select staff_id ,staff_password from staff where staff_id = '{0}' and staff_password = '{1}'"
    adminInfo = db.exe_fetch(sql.format(staff_id, password),'all')
    print(adminInfo)
    if adminInfo != []:
        session['admin'] = 'admin'
        return redirect(url_for('admin_index'))
    else:
        return redirect(url_for('admin_loginpage'))

@app.route("/admin_logout", methods=['POST'])
def admin_logout():
     session.pop('admin', None)
     return redirect(url_for('admin_loginpage'))

@app.route('/admin_upload', methods=['GET', 'POST'])
def admin_upload():
    if request.method == 'POST':
        file = request.files['image']
        name = request.form['newname']
        if Path(os.getcwd() + '/static/image/food' + str(name) + '.png').exists():
            return render_template("admin_index.html")
        elif Path(os.getcwd() + '/static/image/food' + str(name) + '.jpg').exists():
            return render_template("admin_index.html")
        elif Path(os.getcwd() + '/static/image/food' + str(name) + '.jpeg').exists():
            return render_template("admin_index.html")
        else:
            if 'image' not in request.files:
                return render_template("admin_index.html")
            file = request.files['image']
            if file.filename == "":
                return render_template("admin_index.html")
            if name == "":
                return render_template("admin_index.html")
                filename = str(name) + '.' + silename(file.filename).split('.')[-1]
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                return render_template("admin_index.html")

#Admin End

if __name__ == '__main__':
    ip = input('IP: ')
    if ip == '':
    # Start server.py in localhost:5000
        ip = '127.0.0.1'
        socketio.run(app, debug = True, host=ip, port=5000)
    else:
    # Start server.py with https cert
        cer = os.path.dirname(os.path.realpath(__file__))+"\ssl\certificate.crt"
        key = os.path.dirname(os.path.realpath(__file__))+"\ssl\private.key"

        socketio.run(app, debug = True, host=ip, port=5000, keyfile=key, certfile=cer)