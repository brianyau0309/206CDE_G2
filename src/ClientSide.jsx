import React from 'react'

export default class ClientSide extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return(
      <div className="ClientSide">
        <h1>Pizza Hut</h1>
        <hr/>
        <h3>Hello {this.props.member}!</h3>
        <ul className="side_list">
          <li className="side_li" onClick={this.props.loginFunc}>Member Login</li>
          <li className="side_li">中 | Eng</li>
        </ul>
      </div>
    )
  }
}

