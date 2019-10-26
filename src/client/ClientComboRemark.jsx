import React from 'react'

export default class ClientComboRemark extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'lang': 'eng',
      'open': false,
      'food': '',
      'food_info': {},
      'food_remark': [],
      'qty': 1,
      'num_now': 1,
      'order_remark': [],
      'price': 0
    }
    this.changeQTY = this.changeQTY.bind(this)
    this.resetRemark = this.resetRemark.bind(this)
    this.setRemark = this.setRemark.bind(this)
    this.remarkOnChange = this.remarkOnChange.bind(this)
    this.calPrice = this.calPrice.bind(this)
    this.addOnClick = this.addOnClick.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    return { 'open': props.open, 'food': props.food }
  }
  
  componentDidUpdate(prevProps,prevState) {
    if (prevProps.food != this.props.food || prevProps.food_types != this.props.food_types) {
      this.setState({'qty': 1, 'num_now': 1, 'order_remark': []})
      this.resetRemark()
      this.getFoodInfo()
      this.getFoodRemark()
    }
    if (prevState.num_now != this.state.num_now) {
      console.log(prevState.num_now, this.state.num_now)
      this.setRemark()
    }
  }

  getFoodInfo() {
    fetch(`/api/combo_choice_info?food=${this.state.food}&combo=${this.props.combo}&types=${this.props.food_types}`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({ 'food_info': result.combo_choice_info[0], 'price': result.combo_choice_info[0].PRICE })
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

  changeQTY(change) {
    if (change === 'add') {
      if (this.state.qty < this.props.food_person) {
        this.setState({'qty': this.state.qty+1})
      }
    } 
    else if (change === 'minus') {
      if (this.state.qty > 0) {
        this.setState({'qty': this.state.qty-1})
      }
    }
  }
  
  resetRemark() {
    let all_remark = this.state.order_remark
    let remark_option = document.querySelectorAll('.remark_list input')
    remark_option.forEach(option => {
      option.checked = false
    })
    all_remark[this.state.num_now-1] = []
    this.setState({ 'order_remark': all_remark }, () => this.calPrice())
  }
  
  remarkOnChange() {
    let all_remark = this.state.order_remark
    let temp = []
    let remark_option = document.querySelectorAll('.remark_list input')
    remark_option.forEach(option => {
      if (option.checked)
        temp.push(option.value)
    })
    all_remark[this.state.num_now-1] = temp
    this.setState({ 'order_remark': all_remark }, () => this.calPrice())
  }

  calPrice() {
    console.log(this.state.order_remark)
    let price = this.state.food_info.PRICE
    let all_remark_price = 0
    this.state.order_remark.forEach(num => num.forEach(remark_id => {
      let remark_price = this.state.food_remark.filter(r => r.REMARK_ID === remark_id)[0].PRICE
      all_remark_price += remark_price
    }))
    this.setState({ 'price': price + all_remark_price })
  }

  changeNumNow(num) {
    this.setState({ 'num_now': num })
  }

  setRemark() {
    let remark_option = document.querySelectorAll('.remark_list input')
    remark_option.forEach(option => {
      option.checked = false
    })
    remark_option.forEach(option => {
      if (this.state.order_remark[this.state.num_now-1] !== undefined) {
        if (this.state.order_remark[this.state.num_now-1].filter(r => r === option.value).length > 0) {
          option.checked = true
        }
      }
    })
  }

  addOnClick() {
    for (let i = 0; i < this.state.qty; i++) {
      let remark_list = this.state.order_remark[i]
      if (remark_list === undefined) {remark_list = []}
      this.props.addFood(this.props.food_category,this.state.food,this.props.food_types,remark_list,this.state.price)
    }
    this.props.closeRemark()
  }

  render() {
    let all_remark = this.state.food_remark
    const remark_list = []
    const qty_list = []
    for (let i = 1; i <= this.state.qty; i++) {
      qty_list.push(<span className={this.state.num_now === i ? "qty_item active" : "qty_item"} onClick={() => this.changeNumNow(i)}>{i}</span>)
    }

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
                <input type="radio" name={remark.REMARK} value={remark.REMARK_ID} onChange={this.remarkOnChange} />
                {remark.OPTION_ENG}
              </label>)
            )
          }
      </li>
    ))
    return(
      <div className={this.state.open ? "ClientFoodRemark ClientFoodRemarkActive" : "ClientFoodRemark"}>
        <div className="remark_title">
          <img src="https://img.icons8.com/carbon-copy/100/000000/back.png" onClick={this.props.closeRemark} />
          <h1>Your Order</h1>
        </div>
        <img className="remark_img" src={this.state.food !== '' ? window.location.origin + '/static/image/food/' + this.state.food + '.png' : ''} alt="food image"/>
        <div className="remark_food_name">{this.state.food_info.FOOD_ENG_NAME}</div>
        
        <div className="remark_price_panel">
          <img className="left" src="https://img.icons8.com/carbon-copy/100/000000/back.png" onClick={() => this.changeQTY('minus')} />
          <span>{this.state.qty}</span>
          <img className="right" src="https://img.icons8.com/carbon-copy/100/000000/back.png" onClick={() => this.changeQTY('add')} />
        </div>
        {remark_list.length === 0 ? null : <h3>Remark</h3>}
        {remark_list.length === 0 ? null : qty_list}
        {remark_list.length === 0 ? null : <button className="reset_button" onClick={this.resetRemark}>Reset</button>}
        <ul className="remark_list">
          {remark_component}
        </ul>
        <button className="bottom_btn" disabled={this.state.qty === 0 ? true : false} onClick={this.addOnClick}>Add (HKD {this.state.price})</button>
      </div>
    )
  }
}