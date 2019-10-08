import React from 'react'
import ReactDOM from 'react-dom'

import ClientTop from './ClientTop.jsx'
import ClientMenu from './ClientMenu.jsx'
import ClientMain from './ClientMain.jsx'

const insertNode = document.querySelector("#node")

class Client extends React.Component {
  render() {
    return(
      <div className="Client">
        <input id="side_toggle" type="checkbox" />
        <ClientTop />
        <ClientMenu />
        <ClientMain />
      </div>
    )
  }
}

ReactDOM.render(<Client />, insertNode)
