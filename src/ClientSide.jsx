import React from 'react'

export default class ClientSide extends React.Component {
  render() {
    return(
      <div className="ClientSide">
        <h1>Pizza Hut</h1>
        <hr/>
        <h3>Hello Guest!</h3>
        <ul className="side_list">
          <li className="side_li">Member Login</li>
          <li className="side_li">中 | Eng</li>
        </ul>
      </div>
    )
  }
}

