import React from 'react'
import { generateKeyPair } from 'crypto'

const vocabulary_eng = {'Bill': 'Bill', 'Order': 'Order', 'Date': 'Date', 'Time': 'Time', 'Table': 'Table', 'Staff': 'Staff', 'Product': 'Product', 'State': 'State', 'Price': 'Price', 'Cancel': 'Cancel'}
const vocabulary_chi = {'Bill': '單據', 'Order': '單號', 'Date': '日期', 'Time': '時間', 'Table': '桌號', 'Staff': '員工', 'Product': '產品', 'State': '狀態', 'Price': '價錢', 'Cancel': '取消'}

const BillRow = (props) => {
  return(
    <li>
    <table className="bill_detail">
      <tr>
        <td className="ta-l bill_detail_title">{props.lang === 'eng' ? props.food.FOOD_ENG_NAME : props.food.FOOD_CHI_NAME}</td>
        <td className="ta-l bill_detail_state">{props.food.DISH_STATE}</td>
        <td className="ta-r bill_detail_price">{props.food.PRICE}</td>
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

export default class ClientBill extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      'bill': {}, 
      'vocabulary': vocabulary_eng, 
      'lang': 'eng',
      'membership': 'None',
      'membership_list': []
    }
    this.cancel_food = this.cancel_food.bind(this)
    this.getMemberShipList = this.getMemberShipList.bind(this)
  }

  componentDidMount() {
    this.getMemberShipList()
  }

  static getDerivedStateFromProps(props, state) {
    if (props.lang !== state.lang && state.lang === "eng") {
      return { 'vocabulary': vocabulary_chi, 'lang': 'chi'}
    } else if (props.lang !== state.lang && state.lang === "chi") {
      return { 'vocabulary': vocabulary_eng, 'lang': 'eng'}
    }
    if (props.order_bill !== state.bill) {
      return { 'bill': props.order_bill }
    }
    if (props.block !== state.block) {
      return { 'block' : 'yes' }
    }
    if (props.membership !== 'None') {
      console.log(props.membership)
      return { 'membership': props.membership }
    }
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
          this.props.loadBill()
        })
      }
    })
  }

  getMemberShipList() {
    fetch('/api/membership').then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({'membership_list': result.membership})
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
      <div className="ClientBill translateX-3">
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
            <td>{this.state.vocabulary.Date}: {this.state.bill.bill.length !== 0 ? new Date(this.state.bill.bill[0].ORDER_DATE).toDateString() : ''}</td>
            <td>{this.state.vocabulary.Time}: {this.state.bill.bill.length !== 0 ? new Date(this.state.bill.bill[0].ORDER_DATE).toLocaleTimeString() : ''}</td>
          </tr>
          <tr>
            <td>{this.state.vocabulary.Table}: {this.props.table}</td>
            <td>{this.state.vocabulary.Staff}: {this.state.bill.bill.length !== 0 ? this.state.bill.bill[0].STAFF_NAME : ''}</td>
          </tr>
        </table>
        <ul className="bill_detail_list">
          <li className="bill_detail first">
            <tr>
              <td className="ta-l bill_detail_title">{this.state.vocabulary.Product}</td>
              <td className="ta-l bill_detail_state">{this.state.vocabulary.State}</td>
              <td className="ta-r">{this.state.vocabulary.Price}</td>
              <td className="ta-r">{this.state.vocabulary.Cancel}</td>
            </tr>
          </li>
          {bill_detail}
        </ul>
        <div className="checkout_field">
          <div>{this.state.lang === 'eng' ? 'Service Charge' : '服務費'}: +10%</div>
          <div>{this.state.lang === 'eng' ? 'Membership' : '會員'}: {this.props.membership}</div>
          <div>{this.state.lang === 'eng' ? 'Total Price' : '總費用'}: {
          this.state.bill.bill[0] ? 
          (this.state.bill.bill[0].TOTAL_PRICE*1.1*(
            this.props.membership !== 'None' && this.state.membership_list.length > 0 ? 
            this.state.membership_list.filter(membership => membership.MEMBERSHIP_NAME === this.props.membership)[0].DISCOUNT 
            : 1)).toFixed(1)
          : 0
          }
          </div>
          <button className="checkout_button" onClick={this.props.pay}>{this.state.lang === 'eng' ? 'Call Waiter' : '呼叫服務員'}</button>
        </div>
      </div>
    )
  }
}
