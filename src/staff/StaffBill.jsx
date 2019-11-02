import React from 'react'

const BillRow = (props) => {
  return(
    <li>
    <table className="bill_detail">
      <tr>
        <td className="ta-l bill_detail_title">{props.lang === 'eng' ? props.food.FOOD_ENG_NAME : props.food.FOOD_CHI_NAME}</td>
        <td className="ta-l bill_detail_state">{props.food.DISH_STATE}</td>
        <td className="ta-r bill_detail_price">{props.food.PRICE}</td>
        <td className="ta-r"><button className="cancel_button" onClick={() => props.cancel_food(props.order,props.food.FOOD,props.food.ORDER_SEQUENCE)}>X</button></td>
      </tr>
    </table>
      {
        props.food.COMBO_FOOD ? 
        props.food.COMBO_FOOD.map(cf => (
          <table className="bill_detail">
            <tr>
              <td className="ta-l bill_detail_title" style={{paddingLeft: "2vw"}}>{props.lang === 'eng' ? cf.FOOD_ENG_NAME : cf.FOOD_CHI_NAME}</td>
              <td className="ta-l bill_detail_state">{cf.DISH_STATE}</td>
              <td className="ta-r bill_detail_price">+{cf.PRICE}</td>
              <td className="ta-r"></td>
            </tr>
            {
              cf.REMARK ? 
              cf.REMARK.map(r => (
                <tr>
                  <td className="ta-l bill_detail_title" style={{paddingLeft: "4vw"}}>{props.lang === 'eng' ? r.REMARK_ENG : r.REMARK_CHI}</td>
                  <td className="ta-l bill_detail_state"></td>
                  <td className="ta-r bill_detail_price">+{r.REMARK_PRICE}</td>
                  <td className="ta-r"></td>
                </tr>
              ))
              : 
              null
            }
          </table>  
        ))
        :
        null
      }
      {
        props.food.REMARK ?
        props.food.REMARK.map(r => (
          <table className="bill_detail">
            <tr>
              <td className="ta-l bill_detail_title" style={{paddingLeft: "2vw"}}>{props.lang === 'eng' ? r.REMARK_ENG : r.REMARK_CHI}</td>
              <td className="ta-l bill_detail_state"></td>
              <td className="ta-r bill_detail_price">+{r.REMARK_PRICE}</td>
              <td className="ta-r"></td>
            </tr>
          </table>
        ))
        :
        null
      }
    </li>
  )
}

export default class StaffBill extends React.Component {
  constructor(props) {
    super(props)
    this.state = {'bill': {}}
    this.cancel_food = this.cancel_food.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.order_bill !== state.bill) {
      return { 'bill': props.order_bill }
    }
  }

  cancel_food(order, food, seq) {
    this.props.loadBill()
    console.log(order,food,seq)
    fetch(`/cancel_food`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({'cancel': {'order_id': order, 'food': food, 'sequence': seq}})
    }).then(res => {
      if (res.ok) {
        res.json().then(result => {
          console.log(result)
        })
      }
    })
  }

  render() {
    let bill_detail = []
    if (this.state.bill.food) {
      bill_detail = this.state.bill.food.map(f => <BillRow order={this.state.bill.bill[0] ? this.state.bill.bill[0].ORDER_ID : ''} lang={this.state.lang} food={f} cancel_food={this.cancel_food} />)
    }
    return(
      <div className="StaffBill">
        <div className="bill_title">
          <label for="bill_toggle">
            <img src="https://img.icons8.com/carbon-copy/100/000000/back.png"/>
          </label>
          <span>{this.state.vocabulary.Bill}</span>
        </div>
        <table className="bill_info">
          <tr rowspan="2">
            <td onClick={() => console.log(this.state)}>{this.state.vocabulary.Order}: {this.state.bill.bill.length !== 0 ? this.state.bill.bill[0].ORDER_ID : ''}</td>
          </tr>
          <tr>
            <td>Date: {this.state.bill.bill.length !== 0 ? new Date(this.state.bill.bill[0].ORDER_DATE).toDateString() : ''}</td>
            <td>Time: {this.state.bill.bill.length !== 0 ? new Date(this.state.bill.bill[0].ORDER_DATE).toLocaleTimeString() : ''}</td>
          </tr>
          <tr>
            <td>Table: {this.state.bill.bill.length !== 0 ? this.state.bill.bill[0].ORDER_STATE : ''}</td>
            <td>Staff: {this.state.bill.bill.length !== 0 ? this.state.bill.bill[0].STAFF_NAME : ''}</td>
          </tr>
        </table>
        <ul className="bill_detail_list">
          <li className="bill_detail first">
            <tr>
              <td className="ta-l bill_detail_title">Product</td>
              <td className="ta-l bill_detail_state">State</td>
              <td className="ta-r">Price</td>
              <td className="ta-r">Cancel</td>
            </tr>
          </li>
          {bill_detail}
        </ul>
        <div className="checkout_field">
          <div>Service Charge: +10%</div>
          <div>Membership: {this.state.bill.bill[0] ? this.state.bill.bill[0].MEMBER ? this.state.bill.bill[0].MEMBER : 'None' : 'None'}</div>
          <div>Total Price: {this.state.bill.bill[0] ? this.state.bill.bill[0].TOTAL_PRICE : 0}</div>
          <button className="checkout_button">Pay</button>
        </div>
      </div>
    )
  }
}
