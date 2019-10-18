import React from 'react'
import { Route, Switch, withRouter } from 'react-router-dom'

import StaffCombo from './StaffCombo.jsx'
import StaffFood from './StaffFood.jsx'

class StaffMain extends React.Component {
  render() {
    return(
      <div className="StaffMain translateX-3">
          <Switch>
            <Route path="/staff/food/:id" component={StaffFood} />
            <Route path="/staff/food" component={StaffFood} />
            <Route path="/staff" component={StaffCombo} />
          </Switch>
      </div>
    )
  }
}

export default withRouter(StaffMain)
