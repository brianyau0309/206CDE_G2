import React from 'react'

export default class ClientBill extends React.Component {
  render() {
    return(
      <div className="ClientBill translateX-3">
        <label for="bill_toggle">
          <img src="https://img.icons8.com/carbon-copy/100/000000/back.png"/>
        </label>
        <span>Bill</span>
        <hr/>
        <div>Order: </div>
        <div>Table: </div>
        <div>Time: </div>
        <div>Staff: </div>
      </div>
    )
  }
}
