import React from 'react'

export default class StaffNewOrder extends React.Component {
  constructor() {
    super()
    this.state = {
      'table': []
    }
    this.loadTable = this.loadTable.bind(this)
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

  render() {
    return(
      <div className="StaffNewOrder">
        <div onClick={() =>console.log(this.state)}>New Order</div>
        {this.state.table.map(table => (
          <label>
            <input type="checkbox" disabled={table.TABLE_AVAILABLE === 'Y' ? false : true}></input>
            <span>Table ID: {table.TABLE_ID}</span>
            <span>Table Sit: {table.TABLE_SIT}</span>
          </label>
        ))}
      </div>
    )
  }
}