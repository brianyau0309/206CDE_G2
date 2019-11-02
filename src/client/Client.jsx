import React from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect, withRouter } from 'react-router-dom'

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
                   'member': null, 
                   'lang': 'eng',
                   'bill_btn': 'active', 
                   'PageHeight': 0,
                   'order_bill': {}
                  }
    this.login = this.login.bind(this)
    this.getMemberInfo = this.getMemberInfo.bind(this)
    this.changeLang = this.changeLang.bind(this)
    this.changeBillBtn = this.changeBillBtn.bind(this)
    this.logout = this.logout.bind(this)
  }

  componentDidMount() {
    var socket = io.connect(window.location.origin)
      
    socket.on('connect', function() {
      socket.send('User has connected!');
    });
    
    socket.on('message', function(msg) {
      console.log(msg);
    });

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
            this.getMemberInfo()
          } else {
            console.log('Fail')
          }
        })
      }
    })
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
          console.log(info.result)
          this.setState({ 'member': info.result, 'lang': this.state.lang })
        })
      }
    })
  }

  logout() {
    fetch(`/table_logout`, {method: 'POST'}).then(res => {
      if (res.ok) {
        res.json().then(result => {
          if (result.result === 'success') {
            this.setState({ 'member': null })
          } else if (result.result === 'error') {
            alert('Log out Error. Please contact the staff.')
          }
        })
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
    let order = ''
    fetch('/api/whoami', {
      method: 'POST',
      mode: 'cors',
      credentials: 'include'
    }).then(res => {
      if (res.ok) {
        res.json().then(result => {
          order = result.order
          console.log(order)
          fetch('/api/bill', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }).then(res => {
            if (res.ok) {
              res.json().then(result => {
                this.setState({'order_bill': result}, () => console.log(this.state.order_bill))
              })
            }
          })
        })
      }
    })
  }

  render() {
    return(
      <div className="Client">
        <input id="side_toggle" type="checkbox" />
        <label for="side_toggle" className="cover"></label>
        <input id="bill_toggle" type="checkbox" />
        <label for="bill_toggle">
          <img id="bill_btn" className={(this.state.bill_btn === 'active') ? 'bill_btn_active' : 'bill_btn_deactive'} src="https://img.icons8.com/carbon-copy/100/000000/bill.png" alt="Bill Toggle Button" />
        </label>
        <ClientTop />
        <Router>
          <ClientMenu lang={this.state.lang} />
          <div className="ClientMain translateX-3" onScroll={this.changeBillBtn}>
            <Switch>
              <Route path="/client/food/combo">
                <ClientCombo lang={this.state.lang} />
              </Route>
                <Route path="/client/food/:category" render={(props) => <ClientFood {...props} lang={this.state.lang} />}/>
              <Redirect from="/client" to="/client/food/combo" />
            </Switch>
          </div>
        </Router>
        <ClientSide memberName={this.state.member ? this.state.member.MEMBER_SURNAME : null} loginFunc={this.login} logoutFunc={this.logout} lang={this.state.lang} changeLang={this.changeLang}/>
        <ClientBill lang={this.state.lang} order_bill={this.state.order_bill.food ? this.state.order_bill : {'bill': [], 'food': []}} />
      </div>
    )
  }
}
