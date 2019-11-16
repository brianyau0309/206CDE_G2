import React from 'react'

export default class StaffHomw extends React.Component {
  constructor() {
    super()
  }

  render() {
    return(
      <div className="StaffHome">
        <h1>Staff Information</h1>
        <div>Staff ID: </div>
        <div>{this.props.staff_info.STAFF_ID}</div>
        <div>Staff Name:</div>
        <div>{this.props.staff_info.STAFF_NAME}</div>
        <div>Position: </div>
        <div>{this.props.staff_info.POSITION}</div>
      </div>
    )
  }
}
