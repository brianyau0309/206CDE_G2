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
        <td className="ta-r bill_detail_ok">
        {
          props.food.CATEGORY_NAME !== 'combo' && props.food.DISH_STATE == 'cooked' ?
            <button className="served_button" onClick={() => props.served_food(props.order,props.food.FOOD,props.food.ORDER_SEQUENCE)}>OK</button>
            : null
        }
        </td>
        <td className="ta-r">
        {
          props.food.COMBO_FOOD ?
            props.food.COMBO_FOOD.filter(food => food.DISH_STATE === 'served').length > 0 ?
              null
              : <button className="cancel_button" onClick={() => props.cancel_food(props.order,props.food.FOOD,props.food.ORDER_SEQUENCE)}>X</button>
          : props.food.DISH_STATE === 'preparing' ? 
            <button className="cancel_button" onClick={() => props.cancel_food(props.order,props.food.FOOD,props.food.ORDER_SEQUENCE)}>X</button>
            : null
        }
        </td>
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
              <td className="ta-r bill_detail_ok">
              {
                cf.CATEGORY_NAME !== 'combo' && cf.DISH_STATE !== 'served' ?
                  <button className="served_button" onClick={() => props.served_food(props.order,cf.FOOD,cf.ORDER_SEQUENCE)}>OK</button>
                : null
              }
              </td>
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
              : null
            }
          </table>  
        ))
        : null
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
        : null
      }
    </li>
  )
}

export default class StaffBill extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      'bill': {}, 'open': false, 'payments': [], 'payment_rate': '', 'membership': '',
      'combo_toggle': false, 'combo_id': '', 'combo_info': '',
      'food_toggle': false, 'food_id': '', 'food_info': ''
    }
    this.addFood = this.addFood.bind(this)
    this.served_food = this.served_food.bind(this)
    this.cancel_food = this.cancel_food.bind(this)
    this.closeOrder = this.closeOrder.bind(this)
    this.closeCombo = this.closeCombo.bind(this)
    this.closeFood = this.closeFood.bind(this)
    this.loadPayment = this.loadPayment.bind(this)
    this.handlePaymentChange = this.handlePaymentChange.bind(this)
    this.getMemberShip = this.getMemberShip.bind(this)
  }

  componentDidMount() {
    this.loadPayment()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.bill !== this.state.bill) {
      this.getMemberShip()
    }
  }

  static getDerivedStateFromProps(props, state) {
    return { 'bill': props.order_bill, 'open': props.open}
  }

  getMemberShip() {
    if (this.state.bill) {
      if (this.state.bill.bill[0].MEMBER) {
        console.log('OK')
        fetch('/api/member_membership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({'member': this.state.bill.bill[0].MEMBER})
        }).then(res => {
          if (res.ok) {
            res.json().then(result => {
              console.log(result.membership)
              this.setState({'membership': result.membership.MEMBERSHIP_NAME})
            })
          }
        })
      }
    }
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

  served_food(order, food, seq) {
    fetch(`/food_served`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({'served': {'orderID': order, 'food': food, 'sequence': seq}})
    }).then(res =>{ 
      if (res.ok) {
        res.json().then(result => {
          console.log(result)
          this.props.openBill(this.state.bill.bill ? this.state.bill.bill[0].ORDER_ID : '')
        })
      }
    })
  }

  cancel_food(order, food, seq) {
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
          fetch(`/api/order_table?order=${this.state.bill.bill[0].ORDER_ID}`).then(res => {
            if (res.ok) {
              res.json().then(result => {
                const data = result.order_table
                var socket = this.props.socket
                for (let i = 0; i < data.length; i++) {
                  socket.emit('receivePayment',data[i])
                }
              })
            }
          })
        })
      }}
    )}

  render() {
    let bill_detail = []
    if (this.state.bill.food) {
      bill_detail = this.state.bill.food.map(f => <BillRow order={this.state.bill.bill[0] ? this.state.bill.bill[0].ORDER_ID : ''} lang={this.state.lang} food={f} cancel_food={this.cancel_food} served_food={this.served_food} />)
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
            <td><input id="food_input" type="text"/><button onClick={this.addFood}>Add</button></td>
            <td></td>
          </tr>
          <tr rowspan="2">
            <td style={{width: '100%'}}>Date: {this.state.bill.bill ? this.state.bill.bill[0].ORDER_DATE : ''}</td>
          </tr>
          <tr>
            <td>Table: {this.state.bill.bill ? this.state.bill.bill[0].ORDER_STATE : ''}</td>
          </tr>
          <tr>
            <td>Staff: {this.state.bill.bill ? this.state.bill.bill[0].STAFF_NAME : ''}</td>
          </tr>
        </table>
        <ul className="bill_detail_list">
          <li className="bill_detail first">
            <tr>
              <td className="ta-l bill_detail_title">Product</td>
              <td className="ta-l bill_detail_state">State</td>
              <td className="ta-r">Price</td>
              <td className="ta-r">Serve</td>
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
          <div>Total Price: {this.state.bill.bill && this.state.payment_rate != '' ? (this.state.bill.bill[0].TOTAL_PRICE*1.1*(this.state.membership === "gold" ? 0.9 : 1)*this.state.payments.filter(p => p.PAYMENT_METHOD_ID === this.state.payment_rate)[0].PRICE_RATE / 100).toFixed(1) : 0}</div>
          <button className="checkout_button" onClick={this.closeOrder}>Receive Payment</button>
        </div>
        <StaffComboChoice order={this.state.bill.bill ? this.state.bill.bill[0].ORDER_ID : ''} loadBill={this.props.openBill} open={this.state.combo_toggle} close={this.closeCombo} combo={this.state.combo_id} />
        <StaffFoodRemark order={this.state.bill.bill ? this.state.bill.bill[0].ORDER_ID : ''} loadBill={this.props.openBill} open={this.state.food_toggle} close={this.closeFood} food={this.state.food_id} />
      </div>
    )
  }
}
