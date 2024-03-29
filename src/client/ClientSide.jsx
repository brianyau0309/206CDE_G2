import React from 'react'

const vocabulary_eng = {'ToLang': '中文', 'Hello': 'Hello', 'Guest': 'Guest', 'Login': 'Member Login', 'Payment': 'Payment Method', 'Discount': 'Discount'}
const vocabulary_chi = {'ToLang': 'English', 'Hello': '你好', 'Guest': '客人', 'Login': '會員登入', 'Payment': '付款方式', 'Discount': '優惠'}

const PaymentRow = (props) => {
  return (
    <tr>
      <td className="ta-r">{props.payment.PAYMENT_METHOD_NAME}</td>
      <td className="ta-r">{props.payment.PRICE_RATE}%</td>
    </tr>
  )
}

export default class ClientSide extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 'vocabulary': vocabulary_eng, 'lang': 'eng', 'payment': [] }
    this.loadPayment = this.loadPayment.bind(this)
  }

  componentDidMount(){
    this.loadPayment()
  }

  loadPayment() {
    fetch(`/api/payment`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          console.log(result.payment)
          this.setState({'payment': result.payment})
        })
      }
    })
  }

  static getDerivedStateFromProps(props, state) {
    if (props.lang !== state.lang && state.lang === "eng") {
      return { 'vocabulary': vocabulary_chi, 'lang': 'chi'}
    } else if (props.lang !== state.lang && state.lang === "chi") {
      return { 'vocabulary': vocabulary_eng, 'lang': 'eng'}
    }
  }

  render() {
    const payment_method = this.state.payment.map(p => <PaymentRow payment={p}/>)
    return(
      <div className="ClientSide">
        <img id="side_logo" src="https://upload.wikimedia.org/wikipedia/zh/thumb/9/99/Pizza_Hut.svg/200px-Pizza_Hut.svg.png" alt="Pizza Hut" />
        <h3>{this.state.vocabulary.Hello} {this.props.memberName ? this.props.memberName : this.state.vocabulary.Guest}!</h3>
        <ul className="side_list">
          {this.props.memberName ? 
          <li className="side_li" onClick={this.props.logoutFunc}>
            {this.state.lang === 'eng' ? 'Member Logout' : '會員登出'}
          </li>
          : this.props.QR ?
            ''
          : 
          <li className="side_li">
            <input type="checkbox" id="login_toggle"/>
            <label for="login_toggle">
              {this.state.vocabulary.Login}
            </label>
            <form className="login_panel">
              <table style={{margin: "0 auto"}}>
                <tr>
                  <td className="ta-r">{this.state.lang === 'eng' ? 'Member ID' : '會員ID' }: </td>
                  <td className="ta-l"><input id="login_id"type="text"/></td>
                </tr>
                <tr>
                  <td className="ta-r">{this.state.lang === 'eng' ? 'Password' : '會員密碼' }: </td>
                  <td className="ta-l"><input id="login_password" type="password"/></td>
                </tr>
                <tr>
                  <td colspan='2'><button style={{background: 'red', border: '0', color: 'white', padding: '3px', fontSize: '3vh'}} onClick={this.props.loginFunc}>{this.state.lang ? 'Login' : '登入'}</button></td>
                </tr>
              </table>
            </form>
          </li>
          }
          <li className="side_li">
            <input type="checkbox" id="payment_method_toggle"/>
            <label for="payment_method_toggle">
              {this.state.vocabulary.Payment}
            </label>
            <form className="payment_method_panel">
              <table>
                <tr>
                  <td className="ta-r">{this.state.vocabulary.Payment}</td>
                  <td className="ta-r">{this.state.vocabulary.Discount}</td>
                </tr>
                {payment_method}
              </table>
            </form>
          </li>
          <li style={{paddingTop: '8vh'}}>
          <div>{this.state.lang === 'eng' ? 'Order by Phone' : '手機點餐'}: {this.props.order}</div>
            <a href={window.location.origin+'/loginpage'}><img className="qr" src={window.location.origin+'/static/image/qr.png'}></img></a>
          </li>
        </ul>
        <div className="lang" onClick={this.props.changeLang}>{this.state.vocabulary.ToLang}</div>
      </div>
    )
  }
}

