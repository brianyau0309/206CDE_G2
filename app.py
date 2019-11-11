from flask import Flask, render_template, request, redirect, url_for, session
import cx_Oracle

app = Flask(__name__)
app.secret_key = 'ABCD'
conn = cx_Oracle.connect("G2_team01/ceG2_team01@144.214.177.102/xe")
cur = conn.cursor()
@app.route("/")
def index():
    if session.get('admin'):
        return render_template("index.html")
    else:
        return render_template("admin_login.html")

@app.route("/food")
def food():
    sql = "select food_id, food_eng_name, food_chi_name,food_price,available from food"
    cur.execute(sql)
    result = cur.fetchall()
    return render_template("food.html", result = result)

@app.route("/combo")
def combo():
    sql = "select COMBO_ID, FOOD_ID, TYPES, PRICE from combo_price"
    cur.execute(sql)
    result = cur.fetchall()
    print(type(result))
    sql2 = "select COMBO, PERSON, CATEGORY, QUANTITY from combo_person"
    cur.execute(sql2)
    result2 = cur.fetchall()
    
    return render_template("combo.html", result = result, result2 = result2)

@app.route("/order")
def order():
    sql = "select ORDER_ID, MEMBER, STAFF, PAYMENT_METHOD, ORDER_STATE, ORDER_DATE from orders"
    cur.execute(sql)
    result = cur.fetchall()
    return render_template("order.html", result = result)
    

@app.route("/update", methods=['GET', 'POST'])
def update():
    if 'fid' in request.args:
        foodid = request.args['fid']
        sql = "select food_id, food_eng_name, food_chi_name,food_price,available from food where food_id ='%s'"
        cur.execute(sql % (foodid))
        result = cur.fetchall()

    if request.method == "POST":
        name = request.form['id']
        rad = request.form['r1']
        print(name)
        print(rad)
        return url_for("food")

    return render_template("update.html",foodid = foodid,result=result)
    

@app.route("/delete", methods=['GET','POST'])
def delete():
    if 'fid' in request.args:
        foodid = request.args['fid']
        cur.execute("SELECT available from food where food_id ='%s'"%foodid)
        available = cur.fetchone()
        if available[0] == 'Y':
            sql = "update food set available = 'N' where food_id = '{0}'".format(foodid)
            cur.execute(sql)
            cur.execute('commit')
        if available[0] == 'N':
            sql = "update food set available = 'Y' where food_id = '{0}'".format(foodid)
            cur.execute(sql)
            cur.execute('commit')

@app.route("/add", methods=['POST'])
def add():
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
    cur.execute(sql.format(food_id, food_Catecory, food_Eng_name, '一', food_Disscription_Eng, '一', food_Price, food_Vegetarian))
    cur.execute('commit')
    return redirect(url_for("food"))

@app.route("/admin_loginpage")
def admin_loginpage():
    return render_template("admin_login.html")

@app.route("/admin_login", methods=['POST'])
def admin_login():
    staff_id = request.form['staff_id']
    password = request.form['password']
    sql = "select staff_id ,staff_password from staff where staff_id = '{0}' and staff_password = '{1}'"
    cur.execute(sql.format(staff_id, password))
    adminInfo = cur.fetchall()
    print(adminInfo)
    if adminInfo != []:
        session['admin'] = 'admin'
        return redirect(url_for('index'))
    else:
        return redirect(url_for('admin_loginpage'))

@app.route("/logout", methods=['POST'])
def logout():
     session.pop('admin', None)
     return redirect(url_for('admin_loginpage'))
        





if __name__ == "__main__":
    app.run(debug = True)