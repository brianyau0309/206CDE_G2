import React from 'react'

import StaffComboChoice from './StaffComboChoice.jsx'
import StaffFoodRemark from './StaffFoodRemark.jsx'

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
    this.state = {
      'bill': {}, 'open': false, 'payments': [], 'payment_rate': '',
      'combo_toggle': false, 'combo_id': '', 'combo_info': '',
      'food_toggle': false, 'food_id': '', 'food_info': ''
    }
    this.addFood = this.addFood.bind(this)
    this.cancel_food = this.cancel_food.bind(this)
    this.closeOrder = this.closeOrder.bind(this)
    this.closeCombo = this.closeCombo.bind(this)
    this.closeFood = this.closeFood.bind(this)
    this.loadPayment = this.loadPayment.bind(this)
    this.handlePaymentChange = this.handlePaymentChange.bind(this)
  }

  componentDidMount() {
    this.loadPayment()
  }

  static getDerivedStateFromProps(props, state) {
    return { 'bill': props.order_bill, 'open': props.open}
  }

  addFood() {
    let food_id = document.querySelector('#food_input').value
    fetch(`/api/food?food=${food_id}`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          let food = (result.food.length > 0 ? result.food[0] : '')
          if (food.CATEGORY === 'C1') {
            this.setState({ 'combo_id': food_id, 'combo_info': food, 'combo_toggle': true })
          } else if (food.CATEGORY) {
            this.setState({ 'food_id': food_id, 'food_info': food, 'food_toggle': true })
          } else {
            console.log('No this food')
          }
        })
      }
    })
  }

  cancel_food(order, food, seq) {
    console.log(order,food,seq)
    fetch(`/cancel_food`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({'cancel': {'order_id': order, 'food': food, 'sequence': seq}})
    }).then(res => {
      if (res.ok) {
        res.json().then(result => {
          console.log(result)
          this.props.openBill(this.state.bill.bill ? this.state.bill.bill[0].ORDER_ID : '')
        })
      }
    })
  }
  
  loadPayment() {
    fetch(`/api/payment`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          console.log(result.payment)
          this.setState({'payments': result.payment, 'payment_rate': '1 '})
        })
      }
    })
  }

  handlePaymentChange() {
    let temp = document.querySelector('#payment_select')
    this.setState({'payment_rate':temp.value})
  }

  closeCombo() {
    document.querySelector('.StaffComboChoice').scrollTo(0,0)
    this.setState({ 'combo_toggle': false })
  }

  closeFood() {
    this.setState({ 'food_toggle': false })
  }

  closeOrder() {
    console.log("A", this.state)
    let orderID = this.state.bill.bill[0].ORDER_ID
    fetch(`/pay`, {
      method: 'POST',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({'payment': {
        'orderID': orderID, 
        'method': this.state.payment_rate,
        'member': this.state.bill.bill[0].MEMBER
      }})
    }).then(res => {
      if (res.ok) {
        res.json().then(result => {
          console.log(result)
          this.props.close()
        })
      }
    })
  }

  render() {
    console.log(this.state)
    let bill_detail = []
    if (this.state.bill.food) {
      bill_detail = this.state.bill.food.map(f => <BillRow order={this.state.bill.bill[0] ? this.state.bill.bill[0].ORDER_ID : ''} lang={this.state.lang} food={f} cancel_food={this.cancel_food} />)
    }
    return(
      <div className={this.state.open === true ? 'StaffBill open' : 'StaffBill'}>
        <div className="bill_title">
          <label onClick={this.props.close}>
            <img src="https://img.icons8.com/carbon-copy/100/000000/back.png"/>
          </label>
          <span>Bill</span>
        </div>
        <table className="bill_info">
          <tr rowspan="2">
            <td onClick={() => console.log(this.state)}>Order: {this.state.bill.bill ? this.state.bill.bill[0].ORDER_ID : ''}</td>
          </tr>
          <tr>
            <td><input id="food_input" type="text"/></td>
            <td><button onClick={this.addFood}>Add</button></td>
          </tr>
          <tr>
            <td>Date: {this.state.bill.bill ? new Date(this.state.bill.bill[0].ORDER_DATE).toDateString() : ''}</td>
            <td>Time: {this.state.bill.bill ? new Date(this.state.bill.bill[0].ORDER_DATE).toLocaleTimeString() : ''}</td>
          </tr>
          <tr>
            <td>Table: {this.state.bill.bill ? this.state.bill.bill[0].ORDER_STATE : ''}</td>
            <td>Staff: {this.state.bill.bill ? this.state.bill.bill[0].STAFF_NAME : ''}</td>
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
          <div>Payment Method:  
            <select id="payment_select" onChange={this.handlePaymentChange}>
              {this.state.payments.map(payment => <option value={payment.PAYMENT_METHOD_ID}>{payment.PAYMENT_METHOD_NAME}</option>)}
            </select>
          </div>
          <div>Membership: {this.state.bill.bill ? this.state.bill.bill[0].MEMBER ? this.state.bill.bill[0].MEMBER : 'None' : 'None'}</div>
          <div>Total Price: {this.state.bill.bill && this.state.payment_rate != '' ? (this.state.bill.bill[0].TOTAL_PRICE*1.1*this.state.payments.filter(p => p.PAYMENT_METHOD_ID === this.state.payment_rate)[0].PRICE_RATE / 100).toFixed(2) : 0}</div>
          <button className="checkout_button" onClick={this.closeOrder}>Click to Close Order</button>
        </div>
        <StaffComboChoice order={this.state.bill.bill ? this.state.bill.bill[0].ORDER_ID : ''} loadBill={this.props.openBill} open={this.state.combo_toggle} close={this.closeCombo} combo={this.state.combo_id} />
        <StaffFoodRemark order={this.state.bill.bill ? this.state.bill.bill[0].ORDER_ID : ''} loadBill={this.props.openBill} open={this.state.food_toggle} close={this.closeFood} food={this.state.food_id} />
      </div>
    )
  }
}
