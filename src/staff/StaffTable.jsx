import React from 'react'

import StaffBill from './StaffBill.jsx'

export default class StaffTable extends React.Component {
  constructor() {
    super()
    this.state = {
      'table': [],
      'bill': '',
      'bill_toggle': false,
      'new_order': false
    }
    this.loadTable = this.loadTable.bind(this)
    this.openBill = this.openBill.bind(this)
    this.closeBill = this.closeBill.bind(this)
    this.newOrder = this.newOrder.bind(this)
    this.resetCheckbox = this.resetCheckbox.bind(this)
    this.newOrderToggle = this.newOrderToggle.bind(this)
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

  newOrder() {
    let temp = document.querySelectorAll('.table_selector > input')
    let list = []
    for (let i = 0; i < temp.length; i++) {
      if (temp[i].checked) {
        list.push(temp[i].value)
      }
    }

    fetch(`/create_order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 'table': list })
    }).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.loadTable()
          setTimeout(() => this.resetCheckbox(), 200);
        })
      }
    })
  }

  resetCheckbox() {
    let temp = document.querySelectorAll('.table_select_box > input')
    for (let i = 0; i < temp.length; i++) { temp[i].checked = false }
  }

  newOrderToggle() {
    this.setState({'new_order': !this.state.new_order})
  }

  render() {
    return(
      <div className="StaffTable">
        <div onClick={() =>console.log(this.state)}>Table List<span style={{float: 'right', marginRight: '10px'}} onClick={this.newOrderToggle}>New Order</span></div>
          <table className={this.state.new_order ? "table_table show" : "table_table"}>
            <tr>
              <td></td>
              <td>Table</td>
              <td>Sit</td>
              <td>Status</td>
            </tr>
            {
              this.state.table.map(table => (
                <tr>
                  <td className="table_selector"><input type="checkbox" value={table.TABLE_ID} disabled={table.ORDER_ID ? true : false}></input></td>
                  <td>{table.TABLE_ID}</td>
                  <td>{table.TABLE_SIT}</td>
                  <td>{table.ORDER_ID ? <span onClick={() => this.openBill(table.ORDER_ID)}>{table.ORDER_ID}</span> : 'Available'}</td>
                </tr>
              ))
            }
          </table>
          <button className={this.state.new_order ? "bottom_btn show" : "bottom_btn hide"} style={{position: 'fixed'}} onClick={this.newOrder}>New Order</button>
          <StaffBill openBill={this.openBill} order_bill={this.state.bill_info ? this.state.bill_info : ''} open={this.state.bill_toggle} close={this.closeBill}/>
      </div>
    )
  }
}
