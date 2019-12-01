import React from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

import ClientTop from './ClientTop.jsx'
import ClientMenu from './ClientMenu.jsx'
import ClientCombo from './ClientCombo.jsx'
import ClientFood from './ClientFood.jsx'
import ClientBill from './ClientBill.jsx'
import ClientSide from './ClientSide.jsx'

export default class Client extends React.Component {
  constructor() {
    super()
    this.state = { 
                   'orderID':null,
                   'member': null, 
                   'QR': false,
                   'table': '',
                   'lang': 'eng',
                   'bill_btn': 'active', 
                   'PageHeight': 0,
                   'order_bill': {},
                   'block': 'yes',
                   'socket': '',
                   'membership': 'None'
                  }
    this.login = this.login.bind(this)
    this.getMemberInfo = this.getMemberInfo.bind(this)
    this.changeLang = this.changeLang.bind(this)
    this.changeBillBtn = this.changeBillBtn.bind(this)
    this.logout = this.logout.bind(this)
    this.getSession = this.getSession.bind(this)
    this.loadBill = this.loadBill.bind(this)
    this.pay = this.pay.bind(this)
    this.QRlogout = this.QRlogout.bind(this)
    this.setunBlocked = this.setunBlocked.bind(this)
    this.setBlocked = this.setBlocked.bind(this)
    this.getMemberShip = this.getMemberShip.bind(this)
  }

  componentDidMount() {
    var socket = io.connect(window.location.origin)
    this.setState({'socket': socket},() => console.log(this.state))
    let setunBlocked = this.setunBlocked
    let setBlocked = this.setBlocked
    let loadBill = this.loadBill
    let getMemberShip = this.getMemberShip
    socket.on('addRoom', function(data) {
      console.log(data);
    });
    socket.on('leaveRoom', function(data) {
      console.log(data);
    });
    socket.on('message', function(msg) {
      console.log(msg);
    });
    socket.on('topay', function(msg) {
      console.log(msg);
      setBlocked()
    });
    socket.on('created_order', function(msg){
      loadBill()
      console.log(msg);
      setunBlocked()
    });
    socket.on('reloadbill', function(msg){
      console.log(msg);
      getMemberShip()
      loadBill()
    });
    this.getSession()
    this.getMemberInfo()
    this.loadBill()
  }

  login(e) {
    e.preventDefault()
    let id = document.querySelector('#login_id').value
    let password = document.querySelector('#login_password').value
    fetch(`/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({'login': {'id': id, 'password': password}})
    }).then(res => {
      if (res.ok) {
        res.json().then(loginResult => {
          if (loginResult.result === 'Success') {
            console.log('Success')
            this.loadBill()
            this.getMemberInfo()
            this.getMemberShip()
          } else {
            console.log('Fail')
          }
        })
      }
    })
  }

  getMemberShip() {
    if (this.state.order_bill.bill[0].MEMBER) {
      fetch('/api/member_membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({'member': this.state.order_bill.bill[0].MEMBER})
      }).then(res => {
        if (res.ok) {
          res.json().then(result => {
            this.setState({'membership': result.membership.MEMBERSHIP_NAME})
          })
        }
      })
    }
  }

  changeLang() {
    if (this.state.lang === 'eng') {
      this.setState({ 'lang': 'chi' })
    } else {
      this.setState({ 'lang': 'eng' })
    }
  }

  getMemberInfo() {
    fetch(`/myinfo`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include'
    }).then(res => {
      if (res.ok) {
        res.json().then(info => {
          this.setState({ 'member': info.result, 'lang': this.state.lang })
        })
      }
    })
  }

  getSession(){
    fetch(`/api/session`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          console.log(result.table)
          if (result.QR) {this.setState({ 'QR': true })}
          if (result.table) {this.setState({ 'table': result.table })}
          let socket = this.state.socket
          let logout = this.logout
          let QRlogout = this.QRlogout
          let setBlocked = this.setBlocked
          socket.emit('addRoom',{'room':result.table});
          socket.send('User has connected!')
          socket.on('receivePayment',function(msg){
            console.log(msg);
            logout()
            QRlogout()
            location.reload(true);
            setBlocked()
          });
        })
      }
    })
  }
  
  logout() {
    fetch(`/member_logout`, {method: 'POST'}).then(res => {
      if (res.ok) {
        res.json().then(result => {
          if (result.result === 'success') {
            this.setState({ 'member': null, 'membership': 'None' })
          } else if (result.result === 'error') {
            console.log('Log out Error. Please contact the staff.')
          }
        })
      }
    })
  }

 QRlogout(){
    fetch(`/QRlogout`, {method: 'POST'}).then(res => {
      if (res.ok) {
        res.json().then(result => 
          {console.log(result)}
          )
      }
    })
 }
  changeBillBtn() {
    let newPageHeight = document.querySelector('.ClientMain').scrollTop
    if (newPageHeight > this.state.PageHeight) {
      this.setState({ 'bill_btn': 'deactive'})
    } else {
      this.setState({ 'bill_btn': 'active'})
    }
    this.setState({'PageHeight': newPageHeight})
  }

  loadBill() {
    console.log('loading bill')
    fetch(`/api/whoami`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include'
    }).then(res => {
      if (res.ok) {
        res.json().then(result => {
          let order = result.order
          console.log(order)
          if (order.ORDER_ID !== undefined) {this.setunBlocked()}
          this.setState({'orderID':order.ORDER_ID}, () => console.log(this.state.orderID))
          fetch(`/api/bill?orderID=${order.ORDER_ID}`).then(res => {
            if (res.ok) {
              res.json().then(result => {
                console.log(result)
                this.setState({'order_bill': result}, () => console.log(this.state.order_bill))
              })
            }
          })
        })
      }
    })
  }

  pay(){
    fetch(`/api/session`).then(res => {
      if (res.ok) {
        res.json().then(result => {
        var table = result.table
        var socket = this.state.socket
        socket.emit('topay',table);
        this.setBlocked()
      })
    }
  })
  }

  setunBlocked(){
    this.setState({ 'block' : null })
  }

  setBlocked(){
    this.setState({ 'block' : 'yes' })
  }

  render() {
    return(
      <div className="Client"> 
      {this.state.block ? 
        <div className="Blocked">
          <img src={window.location.origin + "/static/image/client/cover.jpeg"}/>
          <p>Please wait for the staff come</p>
        </div>
        : '' }
        <input id="side_toggle" type="checkbox" /> 
        <label for="side_toggle" className="cover"> 
        </label> 
        <input id="bill_toggle" type="checkbox" />
        <label for="bill_toggle" onClick={this.getMemberShip}>
          <img id="bill_btn" className={(this.state.bill_btn === 'active') ? 'bill_btn_active' : 'bill_btn_deactive'} src="https://img.icons8.com/carbon-copy/100/000000/bill.png" alt="Bill Toggle Button" />
        </label>
        <ClientTop />
        <Router>
          <ClientMenu lang={this.state.lang} />
          <div className="ClientMain translateX-3" onScroll={this.changeBillBtn}>
            <Switch>
              <Route path="/client/food/combo">
                <ClientCombo lang={this.state.lang} loadBill={this.loadBill} orderID={this.state.orderID}/>
              </Route>
                <Route path="/client/food/:category" render={(props) => <ClientFood {...props} lang={this.state.lang} loadBill={this.loadBill} orderID={this.state.orderID}/>}/>
              <Redirect from="/client" to="/client/food/combo" />
            </Switch>
          </div>
        </Router>
        <ClientSide QR={this.state.QR} order={this.state.order_bill.bill ? this.state.order_bill.bill[0].ORDER_ID : null} loadBill={this.loadBill} memberName={this.state.member ? this.state.member.MEMBER_SURNAME : null} loginFunc={this.login} logoutFunc={this.logout} lang={this.state.lang} changeLang={this.changeLang}/>
        <ClientBill membership={this.state.membership} table={this.state.table} loadBill={this.loadBill} lang={this.state.lang} order_bill={this.state.order_bill.food ? this.state.order_bill : {'bill': [], 'food': []}} pay={this.pay} block={this.state.block} />
      </div>
    )
  }
}
