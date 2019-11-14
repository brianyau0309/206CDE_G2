import React from 'react'
import { BrowserRouter as Router, Route, Switch, NavLink } from 'react-router-dom'

import StaffTable from './StaffTable.jsx'
import StaffMessage from './StaffMessage.jsx'
import StaffHome from './StaffHome.jsx'

export default class Staff extends React.Component {
  constructor() {
    super()
    this.state = {
      'socket':'',
      'messages': [],
      'staff_info': '',
      'popup': false
    }
    this.loadMessage = this.loadMessage.bind(this)
    this.showPop = this.showPop.bind(this)
    this.loadStaffInfo = this.loadStaffInfo.bind(this)
  }

  componentDidMount() {
    var socket = io.connect(window.location.origin)
    this.setState({'socket': socket})
    let loadMessage = this.loadMessage
      
    socket.on('connect', function() {
      socket.send('User has connected!');
      socket.emit('addRoom',{'room':'staff'});
    });
    
    socket.on('message', function(msg) {
      console.log(msg);
    });

    socket.on('staffmessage', function(msg) {
      console.log(msg);
      loadMessage(msg)
    });
    
    this.loadStaffInfo()
  }

  loadMessage(msg) {
    let temp = this.state.messages
    if (temp.length === 50) temp.pop()
    temp.unshift(msg)
    this.setState({'messages': temp}, () => this.showPop())
  }

  showPop() {
    this.setState({'popup': true})
    setTimeout(() => this.setState({'popup': false}), 3000);
  }

  loadStaffInfo() {
    fetch('/api/staff_info').then(res => {
      if (res.ok) {
        res.json().then(result => {
          console.log(result.staff_info)
          this.setState({'staff_info': result.staff_info})
        })
      }
    })
  }

  render() {
    return(
      <div className="Staff">
        <div className="StaffTop">Staff Page</div>
        <Router>
          <ul className="StaffMenu">
            <NavLink to="/staff/"><li>Home</li></NavLink>
            <NavLink to="/staff/table_list"><li>Table State</li></NavLink>
            <NavLink to="/staff/message"><li>Message</li></NavLink>
          </ul>
          <div className="StaffMain">
            <Switch>
              <Route path="/staff/table_list">
                <StaffTable socket={this.state.socket} />
              </Route>
              <Route path="/staff/message">
                <StaffMessage messages={this.state.messages} />
              </Route>
              <Route path="/staff/">
                <StaffHome staff_info={this.state.staff_info} />
              </Route>
            </Switch>
          </div>
          <NavLink to="/staff/message"><div className={this.state.popup ? "popup open" : "popup"}>{this.state.messages[0] ? this.state.messages[0] : null}</div></NavLink>
        </Router>
      </div>
    )
  }
}