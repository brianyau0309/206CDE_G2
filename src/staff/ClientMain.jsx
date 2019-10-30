import React from 'react'
import { Route, Switch, withRouter } from 'react-router-dom'

import ClientCombo from './ClientCombo.jsx'
import ClientFood from './ClientFood.jsx'

class ClientMain extends React.Component {
  render() {
    return(
      <div className="ClientMain translateX-3">
          <Switch>
            <Route path="/client/food/:id" component={ClientFood} />
            <Route path="/client/food" component={ClientFood} />
            <Route path="/client" component={ClientCombo} />
          </Switch>
      </div>
    )
  }
}

export default withRouter(ClientMain)
