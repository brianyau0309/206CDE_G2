import React from 'react'

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
        <td className="ta-r"><button className="cancel_button">X</button></td>
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
    this.state = {'order_bill': {}, 'vocabulary': vocabulary_eng, 'lang': 'eng' }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.lang !== state.lang && state.lang === "eng") {
      return { 'vocabulary': vocabulary_chi, 'lang': 'chi'}
    } else if (props.lang !== state.lang && state.lang === "chi") {
      return { 'vocabulary': vocabulary_eng, 'lang': 'eng'}
    }
    if (props.order_bill !== state.order_bill) {
      console.log(props.order_bill)
      console.log(state.order_bill)
      return { 'order_bill': props.order_bill }
    }
  }

  render() {
    let bill_detail = []
    if (this.state.order_bill.food) {
      bill_detail = this.state.order_bill.food.map(f => <BillRow lang={this.state.lang} food={f} />)
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
            <td onClick={() => console.log(this.state)}>{this.state.vocabulary.Order}: {this.state.order_bill.bill.length !== 0 ? this.state.order_bill.bill[0].ORDER_ID : ''}</td>
          </tr>
          <tr>
            <td>{this.state.vocabulary.Date}: {this.state.order_bill.bill.length !== 0 ? new Date(this.state.order_bill.bill[0].ORDER_DATE).toDateString() : ''}</td>
            <td>{this.state.vocabulary.Time}: {this.state.order_bill.bill.length !== 0 ? new Date(this.state.order_bill.bill[0].ORDER_DATE).toLocaleTimeString() : ''}</td>
          </tr>
          <tr>
            <td>{this.state.vocabulary.Table}: {this.state.order_bill.bill.length !== 0 ? this.state.order_bill.bill[0].ORDER_STATE : ''}</td>
            <td>{this.state.vocabulary.Staff}: {this.state.order_bill.bill.length !== 0 ? this.state.order_bill.bill[0].STAFF_NAME : ''}</td>
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
          <div>Service Charge: +10%</div>
          <div>Membership: {this.state.order_bill.bill[0] ? this.state.order_bill.bill[0].MEMBER ? this.state.order_bill.bill[0].MEMBER : 'None' : 'None'}</div>
          <div>Total Price: {this.state.order_bill.bill[0] ? this.state.order_bill.bill[0].TOTAL_PRICE : 0}</div>
          <button className="checkout_button">Check Out</button>
        </div>
      </div>
    )
  }
}
