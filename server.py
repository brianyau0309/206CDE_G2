#encoding=utf-8
# -*- coding: utf-8 -*-  
import os   
os.environ['NLS_LANG'] = 'SIMPLIFIED CHINESE_CHINA.UTF8'   
from flask import Flask, session, request, render_template, jsonify
from flask_cors import cross_origin
from OracleConn import OracleConn, SQL
from flask_socketio import SocketIO, send

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

@app.route('/api/food/<path:category>')
def foodAPI(category):
    lang = 'eng'
    if request.args.get('lang'):
        lang = request.args.get('lang')
        
    if category == 'vegetarian':
        output = db.exe_fetch(SQL['getVegetarianFood'].format(lang=lang), 'all')
    else:
        output = db.exe_fetch(SQL['getFood'].format(category=category,lang=lang), 'all')

    return jsonify({'food': output})

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

@socketio.on('message')
def handleMessage(msg):
    print('Message: ', msg)
    send(msg, broadcast=True)

if __name__ == '__main__':
    ip = input('IP: ')
    if ip == '':
        ip = '127.0.0.1'
    socketio.run(app, debug = True, host=ip, port=5000)