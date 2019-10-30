import React from 'react'

const vocabulary_eng = {'Bill': 'Bill', 'Order': 'Order', 'Date': 'Date', 'Time': 'Time', 'Table': 'Table', 'Staff': 'Staff'}
const vocabulary_chi = {'Bill': '單據', 'Order': '單號', 'Date': '日期', 'Time': '時間', 'Table': '桌號', 'Staff': '員工'}

export default class ClientBill extends React.Component {
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
      <div className="ClientBill translateX-3">
        <div className="bill_title">
          <label for="bill_toggle">
            <img src="https://img.icons8.com/carbon-copy/100/000000/back.png"/>
          </label>
          <span>{this.state.vocabulary.Bill}</span>
        </div>
        <table className="bill_info">
          <tr rowspan="2">
            <td>{this.state.vocabulary.Order}: </td>
          </tr>
          <tr>
            <td>{this.state.vocabulary.Date}: </td>
            <td>{this.state.vocabulary.Time}: </td>
          </tr>
          <tr>
            <td>{this.state.vocabulary.Table}: </td>
            <td>{this.state.vocabulary.Staff}: </td>
          </tr>
        </table>
      </div>
    )
  }
}
