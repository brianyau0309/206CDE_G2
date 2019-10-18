import React from 'react'

const RemarkItem = (props) => {
  return (
    <li>
      <div>Remark ITEM</div>
      <div>{props.remark.REMARK_ID}</div>
      <div>{props.remark.REMARK}</div>
      <div>{props.remark.REMARK_CHI}</div>
      <div>{props.remark.OPTION_CHI}</div>
      <div>{props.remark.OPTION_ENG}</div>
      <div>{props.remark.PRICE}</div>
    </li>
  )
}

export default class ClientFoodRemark extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      'lang': 'eng',
      'open': false, 
      'food': '',
      'food_info': {},
      'food_remark': []
    }
    this.getFoodInfo = this.getFoodInfo.bind(this)
    this.getFoodRemark = this.getFoodRemark.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    return { 'open': props.open, 'food': props.food }
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.food != this.props.food) {
      this.getFoodInfo()
      this.getFoodRemark()
    }
  }

  getFoodInfo() {
    fetch(`/api/food?food=${this.state.food}`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({ 'food_info': result.food[0] })
        })
      }
    })
  }

  getFoodRemark() {
    fetch(`/api/food_remark?food=${this.state.food}`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({ 'food_remark': result.food_remark })
        })
      }
    })
  }

  render() {
    const remark_list = this.state.food_remark.map(remark => <RemarkItem remark={remark}/>)
    return(
      <div className={this.state.open ? "ClientFoodRemark ClientFoodRemarkActive" : "ClientFoodRemark"}>
        <div className="remark_title">
          <img src="https://img.icons8.com/carbon-copy/100/000000/back.png" onClick={this.props.remarkToggle} />
          <h1>Your Order</h1>
        </div>
        <img className="remark_img" src={window.location.origin + '/static/image/food/' + this.state.food + '.png'} alt="food image"/>
        <div className="remark_food_name">{this.state.food_info.FOOD_ENG_NAME}</div>
        <h3>Remark</h3>
        {this.state.food_remark.length}
        <ul className="remark_list">
          {remark_list}
        </ul>
      </div>
    )
  }
}

