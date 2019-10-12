import React from 'react'

const vocabulary_eng = {'Lang': 'English', 'hello': 'Hello', 'login': 'Member Login'}
const vocabulary_chi = {'Lang': '中文', 'hello': '你好', 'login': '會員登入'}

export default class ClientSide extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 'vocabulary': vocabulary_eng }
  }

  componentWillReceiveProps() {
    if (this.props.lang === 'eng') {
      this.setState({ 'vocabulary': vocabulary_eng})
    } else {
      this.setState({ 'vocabulary': vocabulary_chi})
    }
  }

  render() {
    return(
      <div className="ClientSide">
        <h1>Pizza Hut</h1>
        <hr/>
        <h3>{this.state.vocabulary.hello} {this.props.member}!</h3>
        <ul className="side_list">
          <li className="side_li" onClick={this.props.loginFunc}>{this.state.vocabulary.login}</li>
          <li className="side_li" onClick={this.props.changeLang}>{this.state.vocabulary.Lang}</li>
        </ul>
      </div>
    )
  }
}

