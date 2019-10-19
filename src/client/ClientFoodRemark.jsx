import React from 'react'
export default class ClientFoodRemark extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      'lang': 'eng',
      'open': false, 
      'food': '',
      'food_info': {},
      'food_remark': [],
      'order_remark': [],
      'price': 0
    }
    this.getFoodInfo = this.getFoodInfo.bind(this)
    this.getFoodRemark = this.getFoodRemark.bind(this)
    this.remarkOnChange = this.remarkOnChange.bind(this)
    this.resetRemark = this.resetRemark.bind(this)
    this.calPrice = this.calPrice.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
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
          this.setState({ 'food_info': result.food[0], 'price': result.food[0].FOOD_PRICE })
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

  remarkOnChange() {
    let temp = []
    let remark_option = document.querySelectorAll('.remark_list input')
    remark_option.forEach(option => {
      if (option.checked)
        temp.push(option.value)
    })
    this.setState({ 'order_remark': temp }, () => this.calPrice())
  }

  resetRemark() {
    let remark_option = document.querySelectorAll('.remark_list input')
    remark_option.forEach(option => {
      option.checked = false
    })
    this.setState({ 'order_remark': [] }, () => this.calPrice())
  }

  calPrice() {
    let price = this.state.food_info.FOOD_PRICE
    let all_remark_price = 0
    this.state.order_remark.forEach(remark_id => {
      let remark_price = this.state.food_remark.filter(r => r.REMARK_ID === remark_id)[0].PRICE
      all_remark_price += remark_price
    })
    this.setState({ 'price': price + all_remark_price })
  }
  
  onSubmit() {
    let order = '00000003'
    let food = this.state.food
    let remark = this.state.order_remark
    let price = this.state.price
    fetch(`/api/order_food`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({'new_order': {'order': order, 'food': food, 'remark': remark, 'price': price}})
    }).then(res => res.json().then(result => console.log(result.ordering)))
  }

  render() {
    let all_remark = this.state.food_remark
    const remark_list = []

    while (all_remark.length != 0) {
      let remark_name = all_remark[0].REMARK
      remark_list.push(all_remark.filter(remark => remark.REMARK === remark_name))
      all_remark = all_remark.filter(remark => remark.REMARK !== remark_name)
    }

    const remark_component = remark_list.map(remark => (
      <li>
        <h1>{remark[0].REMARK}</h1>
          {
            remark.map(remark => 
            (
              <label>
                {remark.OPTION_ENG}
                <input type="radio" name={remark.REMARK} value={remark.REMARK_ID} onChange={this.remarkOnChange} />
              </label>)
            )
          }
      </li>
    ))

    return(
      <div className={this.state.open ? "ClientFoodRemark ClientFoodRemarkActive" : "ClientFoodRemark"}>
        <div className="remark_title">
          <img src="https://img.icons8.com/carbon-copy/100/000000/back.png" onClick={this.props.remarkToggle} />
          <h1>Your Order</h1>
        </div>
        <img className="remark_img" src={this.state.food != '' ? window.location.origin + '/static/image/food/' + this.state.food + '.png' : ''} alt="food image"/>
        <div className="remark_food_name">{this.state.food_info.FOOD_ENG_NAME}</div>
        <h3>Remark</h3>
        <button onClick={this.resetRemark}>Reset</button>
        <ul className="remark_list">
          {remark_component}
        </ul>
        <button onClick={this.onSubmit}>Submit ({this.state.price})</button>
      </div>
    )
  }
}