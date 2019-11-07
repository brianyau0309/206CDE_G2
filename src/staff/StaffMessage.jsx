import React from 'react'

export default class StaffMessage extends React.Component {
  constructor() {
    super()
  }

  render() {
    return(
      <div className="StaffMessage">
        Message
        <ol>
          {
            this.props.messages.map(message => (
              <li>{message}</li>                
            ))
          }
        </ol>
      </div>
    )
  }
}