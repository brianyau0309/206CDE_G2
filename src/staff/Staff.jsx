import React from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect, withRouter } from 'react-router-dom'

import StaffTop from './StaffTop.jsx'
import StaffMenu from './StaffMenu.jsx'
import StaffCombo from './StaffCombo.jsx'
import StaffFood from './StaffFood.jsx'
import StaffBill from './StaffBill.jsx'
import StaffSide from './StaffSide.jsx'

export default class Staff extends React.Component {
  constructor() {
    super()
    this.state = { 'member': null, 'lang': 'eng' }
    this.login = this.login.bind(this)
    this.getMemberInfo = this.getMemberInfo.bind(this)
    this.changeLang = this.changeLang.bind(this)
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

  render() {
    return(
      <div className="Staff">
        <input id="side_toggle" type="checkbox" />
        <label for="side_toggle" className="cover"></label>
        <input id="bill_toggle" type="checkbox" />
        <label for="bill_toggle">
          <img id="bill_btn" src="https://img.icons8.com/carbon-copy/100/000000/bill.png" alt="Bill Toggle Button" />
        </label>
        <StaffTop />
        <Router>
          <StaffMenu lang={this.state.lang} />
          <div className="StaffMain translateX-3">
            <Switch>
              <Route path="/staff/food/combo">
                <StaffCombo lang={this.state.lang}/>
              </Route>
              <Route path="/staff/food/:category" render={(props) => <StaffFood {...props} lang={this.state.lang} />} />
              <Redirect from="/staff" to="/staff/food/combo" />
            </Switch>
          </div>
        </Router>
        <StaffSide member={this.state.member} loginFunc={this.login} lang={this.state.lang} changeLang={this.changeLang}/>
        <StaffBill lang={this.state.lang}/>
      </div>
    )
  }
}
