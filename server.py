from flask import Flask, session, request, render_template, jsonify
from flask_socketio import SocketIO, send

app = Flask(__name__)
app.config['SECRET_KEY'] = 'SecretKeyHERE!'

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
    food = [{'food_id': 'F001', 'name': category+' A', 'description': 'This is '+category+' A', 'price': 10.0},{'food_id': 'F002', 'name': category+' B', 'description': 'This is '+category+' B', 'price': 20.0},{'food_id': 'F003', 'name': category+' C', 'description': 'This is '+category+' C', 'price': 30.0}]
    priceGt = request.args.get('priceGt')
    output = []
    if priceGt:
        priceGt = float(priceGt)
        for i in food:
            if i.get('price') >= priceGt:
                output.append(i)
    else:
        output = food

    return jsonify({'food': output})

@app.route('/login', methods = ["post"]) #Login process
def login():
    user = session.get('clientID')
    print(user)
    session['clientID'] = 'Test_ID'
    return jsonify({'login': 'success'})

@app.route('/myinfo', methods = ["post"]) #Login process
def myinfo():
    user = session.get('clientID')
    print(user, 'checking his information')
    return jsonify({'member_id': user})

@socketio.on('message')
def handleMessage(msg):
    print('Message: ', msg)
    send(msg, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug = True)