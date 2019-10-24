import React from 'react'

export default class ClientComboChoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      'lang': 'eng',
      'open': false, 
      'combo': '',
      'combo_info': {},
      'combo_choice': [],
      'price': 0
    }
  }

  static getDerivedStateFromProps(props, state) {
    return { 'open': props.open, 'combo': props.combo }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.combo != this.props.combo) {
      this.getComboInfo()
      this.getComboChoice()
    }
  }

  getComboInfo() {
    fetch(`/api/food?food=${this.state.combo}`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({ 'combo_info': result.food[0], 'price': result.food[0].FOOD_PRICE })
        })
      }
    })
  }

  getComboChoice() {
    fetch(`/api/combo_choice?combo=${this.state.combo}`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({ 'combo_choice': result.combo_choice })
        })
      }
    })
  }

  render() {
    return(
      <div className={this.state.open ? "ClientComboChoice ClientComboChoiceActive" : "ClientComboChoice"}>
        {this.state.combo}
        <div className="remark_title">
          <img src="https://img.icons8.com/carbon-copy/100/000000/back.png" onClick={this.props.choiceToggle} />
          <h1>Combo</h1>
        </div>
      </div>
    )
  }
}