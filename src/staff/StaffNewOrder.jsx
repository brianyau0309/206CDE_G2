import React from 'react'

export default class StaffNewOrder extends React.Component {
  constructor() {
    super()
    this.state = {
      'table': []
    }
    this.loadTable = this.loadTable.bind(this)
    this.newOrder = this.newOrder.bind(this)
    this.resetCheckbox = this.resetCheckbox.bind(this)
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

  newOrder() {
    let temp = document.querySelectorAll('.table_select_box > input')
    console.log(temp)
    let list = []
    var socket = io.connect(window.location.origin)
    for (let i = 0; i < temp.length; i++) {
      if (temp[i].checked) {
        socket.emit('created_order',{'room':temp[i]})
        list.push(temp[i].value)
      }
    }
    console.log(list)

    fetch(`/create_order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 'table': list })
    }).then(res => {
      if (res.ok) {
        res.json().then(result => {
          console.log(result)
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

  render() {
    return(
      <div className="StaffNewOrder">
        <div onClick={() =>console.log(this.state)}>New Order</div>
        {this.state.table.map(table => (
          <label className="table_select_box" style={{display: 'block'}}>
            <input type="checkbox" value={table.TABLE_ID} disabled={table.ORDER_ID ? true : false}></input>
            <span>Table ID: {table.TABLE_ID}</span>
            <span>Table Sit: {table.TABLE_SIT}</span>
          </label>
        ))}
        <button className="bottom_btn" style={{position: 'fixed'}} onClick={this.newOrder}>New Order</button>
      </div>
    )
  }
}