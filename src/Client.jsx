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
                   'PageHeight': 0
                  }
    this.login = this.login.bind(this)
    this.getMemberInfo = this.getMemberInfo.bind(this)
    this.changeLang = this.changeLang.bind(this)
    this.changeBillBtn = this.changeBillBtn.bind(this)
  }

  componentDidMount() {
    var socket = io.connect(window.location.origin)
      
    socket.on('connect', function() {
      socket.send('User has connected!');
    });
    
    socket.on('message', function(msg) {
      console.log(msg);
    });
  }

  login() {
    fetch(`/login`, {
      method: 'POST'
    }).then(res => {
      if (res.ok) {
        res.json().then(loginResult => {
          if (loginResult.login === 'success') {
            this.getMemberInfo()
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
          this.setState({ 'member': info.member_id, 'lang': this.state.lang })
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
        <ClientSide member={this.state.member} loginFunc={this.login} lang={this.state.lang} changeLang={this.changeLang}/>
        <ClientBill lang={this.state.lang}/>
      </div>
    )
  }
}
