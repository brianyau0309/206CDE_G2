import React from 'react'

const vocabulary_eng = {'ToLang': '中文', 'Hello': 'Hello', 'Guest': 'Guest', 'Login': 'Member Login', 'Payment': 'Payment Method'}
const vocabulary_chi = {'ToLang': 'English', 'Hello': '你好', 'Guest': '客人', 'Login': '會員登入', 'Payment': '付款方式'}

const hello = () => (
  <h3>{this.state.vocabulary.hello} {this.props.member}!</h3>
)

export default class ClientSide extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 'vocabulary': vocabulary_eng, 'lang': 'eng' }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.lang !== state.lang && state.lang === "eng") {
      return { 'vocabulary': vocabulary_chi, 'lang': 'chi'}
    } else if (props.lang !== state.lang && state.lang === "chi") {
      return { 'vocabulary': vocabulary_eng, 'lang': 'eng'}
    }
  }

  render() {
    const logoPng = window.location.origin + "/static/image/client/header.png"
    return(
      <div className="ClientSide">
        <img id="side_logo" src="https://upload.wikimedia.org/wikipedia/zh/thumb/9/99/Pizza_Hut.svg/200px-Pizza_Hut.svg.png" alt="Pizza Hut" />
        <h3>{this.state.vocabulary.Hello} {this.props.member ? this.props.member : this.state.vocabulary.Guest}!</h3>
        <ul className="side_list">
          <li className="side_li">
            <input type="checkbox" id="login_toggle"/>
            <label for="login_toggle">
              {this.state.vocabulary.Login}
            </label>
            <form className="login_panel">
              Member ID: <input type="text"/><br/>
              Password: <input type="password"/><br/>
              <button>Login</button>
            </form>
          </li>
          <li className="side_li">{this.state.vocabulary.Payment}</li>
          <li className="side_li" onClick={this.props.changeLang}>{this.state.vocabulary.ToLang}</li>
        </ul>
      </div>
    )
  }
}

