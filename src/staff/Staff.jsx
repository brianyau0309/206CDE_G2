import React from 'react'
import { BrowserRouter as Router, Route, Switch, NavLink } from 'react-router-dom'

import StaffTable from './StaffTable.jsx'
import StaffNewOrder from './StaffNewOrder.jsx'

export default class Staff extends React.Component {
  constructor() {
    super()
    this.state = {'socket':''}
  }

  componentDidMount() {
    var socket = io.connect(window.location.origin)
    this.setState({'socket': socket},() => console.log(this.state))
      
    socket.on('connect', function() {
      socket.send('User has connected!');
      socket.emit('addRoom',{'room':'staff'});
    });
    
    socket.on('message', function(msg) {
      console.log(msg);
    });

    socket.on('topay', function(msg) {
      console.log(msg);
      alert(msg);
    });
    socket.on('created_order', function(msg){
      console.log(msg);
      alert(msg);
    });
  }

  render() {
    return(
      <div className="Staff">
        <div className="StaffTop">Staff Page</div>
        <Router>
          <ul className="StaffMenu">
            <NavLink to="/staff/table_list"><li>Table State</li></NavLink>
            <NavLink to="/staff/new_order"><li>New Order</li></NavLink>
            <NavLink to="/staff/message"><li>Message</li></NavLink>
          </ul>
          <div className="StaffMain">
            <Switch>
              <Route path="/staff/table_list">
                <StaffTable />
              </Route>
              <Route path="/staff/new_order">
                <StaffNewOrder />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    )
  }
}
