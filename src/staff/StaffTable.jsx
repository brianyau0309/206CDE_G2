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
    this.callforpay = this.callforpay.bind(this)
    this.closeBill = this.closeBill.bind(this)
  }

  componentDidMount() {
    this.loadTable()
    this.callforpay()
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
    console.log(this.state)
    fetch(`/api/bill?orderID=${id}`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({'bill': id, 'bill_toggle': true, 'bill_info': result})
        })
      }
    })
  }
  closeBill() {
    this.setState({'bill_toggle': false})
    this.loadTable()
  }

  callforpay(){
    var socket = io.connect(window.location.origin)

    socket.on('callforpay', function(msg) {
      console.log(msg);
      alert(msg);
    });
  }

  render() {
    return(
      <div className="StaffTable">
        <div onClick={() =>console.log(this.state)}>Table List</div>
          <table className="table_table">
            <tr>
              <td>Table</td>
              <td>Sit</td>
              <td>Status</td>
            </tr>
            {this.state.table.map(table => (
                <tr>
                  <td>{table.TABLE_ID}</td>
                  <td>{table.TABLE_SIT}</td>
                  <td>{table.ORDER_ID ? <span onClick={() => this.openBill(table.ORDER_ID)}>{table.ORDER_ID}</span> : 'Available'}</td>
                </tr>
            ))}
          </table>
          <StaffBill openBill={this.openBill} order_bill={this.state.bill_info ? this.state.bill_info : ''} open={this.state.bill_toggle} close={this.closeBill}/>
      </div>
    )
  }
}
