import React from 'react'

const vocabulary_eng = {'ToLang': '中文', 'Hello': 'Hello', 'Guest': 'Guest', 'Login': 'Member Login', 'Payment': 'Payment Method'}
const vocabulary_chi = {'ToLang': 'English', 'Hello': '你好', 'Guest': '客人', 'Login': '會員登入', 'Payment': '付款方式'}

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
              <table>
                <tr>
                  <td className="ta-r">Member ID: </td>
                  <td className="ta-l"><input type="text" /></td>
                </tr>
                <tr>
                  <td className="ta-r">Password: </td>
                  <td className="ta-l"><input type="password"/></td>
                </tr>
                <tr>
                  <td colspan='2'><button>Login</button></td>
                </tr>
              </table>
            </form>
          </li>
          {this.props.member ? () => (<li className="side_li">member</li>) : ''}
          <li className="side_li" onClick={this.props.login}>{this.state.vocabulary.Payment}</li>
        </ul>
        <div className="lang" onClick={this.props.changeLang}>{this.state.vocabulary.ToLang}</div>
      </div>
    )
  }
}

