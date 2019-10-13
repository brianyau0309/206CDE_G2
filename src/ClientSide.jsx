import React from 'react'

const vocabulary_eng = {'ToLang': '中文', 'Hello': 'Hello', 'Guest': 'Guest', 'Login': 'Member Login'}
const vocabulary_chi = {'ToLang': 'English', 'Hello': '你好', 'Guest': '客人', 'Login': '會員登入'}

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
    return(
      <div className="ClientSide">
        <h1>Pizza Hut</h1>
        <hr/>
        <h3>{this.state.vocabulary.Hello} {this.props.member ? this.props.member : this.state.vocabulary.Guest}!</h3>
        <ul className="side_list">
          <li className="side_li" onClick={this.props.loginFunc}>{this.state.vocabulary.Login}</li>
          <li className="side_li" onClick={this.props.changeLang}>{this.state.vocabulary.ToLang}</li>
        </ul>
      </div>
    )
  }
}

