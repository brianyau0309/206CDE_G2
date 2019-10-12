import React from 'react'
import ReactDOM from 'react-dom'
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
    this.state = { 'member': 'Guest' }
    this.login = this.login.bind(this)
    this.getMemberInfo = this.getMemberInfo.bind(this)
  }

  componentDidMount() {
    var socket = io.connect('http://localhost:5000')
      
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

  getMemberInfo() {
    fetch(`/myinfo`, {
      method: 'POST'
    }).then(res => {
      if (res.ok) {
        res.json().then(info => {
          this.setState({ 'member': info.member_id })
        })
      }
    })
  }

  render() {
    return(
      <div className="Client">
        <input id="side_toggle" type="checkbox" />
        <label for="side_toggle" class="cover"></label>
        <input id="bill_toggle" type="checkbox" />
        <label for="bill_toggle">
          <img id="bill_btn" src="https://img.icons8.com/carbon-copy/100/000000/bill.png" alt="Bill Toggle Button" />
        </label>
        <ClientTop />
        <Router>
          <ClientMenu />
          <div className="ClientMain translateX-3">
            <Switch>
              <Route path="/client/food/combo" component={ClientCombo} />
              <Route path="/client/food/:category" component={ClientFood} />
              <Redirect from="/client" to="/client/food/combo" />
            </Switch>
          </div>
        </Router>
        <ClientSide member={this.state.member} loginFunc={this.login}/>
        <ClientBill/>
      </div>
    )
  }
}
