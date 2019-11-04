import React from 'react'

import StaffBill from './StaffBill.jsx'

export default class StaffTable extends React.Component {
  constructor() {
    super()
    this.state = {
      'table': [],
      'bill': '',
      'bill_toggle': false
    }
    this.loadTable = this.loadTable.bind(this)
    this.openBill = this.openBill.bind(this)
  }

  componentDidMount() {
    this.loadTable()
  }

  loadTable() {
    fetch(`/api/table`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({'table': result.table})
        })
      }
    })
  }

  openBill(id) {
    fetch(`/api/bill`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({'bill_id': id, 'bill_toggle': true, 'bill_info': result})
        })
      }
    })
  }
  closeBill() {
    this.setState({'bill_toggle': false})
  }

  render() {
    return(
      <div className="StaffTable">
        <div onClick={() =>console.log(this.state)}>Table List</div>
          <table>
            <tr>
              <td>Table</td>
              <td>Sit</td>
              <td>Status</td>
            </tr>
            {this.state.table.map(table => (
                <tr>
                  <td>{table.TABLE_ID}</td>
                  <td>{table.TABLE_SIT}</td>
                  <td>{table.TABLE_AVAILABLE === "Y" ? 'Available' : <span onClick={() => this.openBill(table.ORDER_ID)}>{table.ORDER_ID}</span>}</td>
                </tr>
            ))}
          </table>
          <StaffBill order_bill={this.state.bill} />
      </div>
    )
  }
}
