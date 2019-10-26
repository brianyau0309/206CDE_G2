import React from 'react'
import ClientComboRemark from './ClientComboRemark.jsx'

const ComboFoodContainer = (props) => {
  const localpath = window.location.origin + '/static/image/food/'
  let category_name = props.food.CATEGORY_NAME
  if (category_name === 'rice' || category_name === 'pasta') {category_name = 'rice_pasta'}
  return(
    <div className={props.category_max <= props.category_list.length && props.category_list.filter(item => item.food === props.food.FOOD).length === 0 ? "combo_food_container deactive" : "combo_food_container"} onClick={() => props.onclickComboFood((props.food.CATEGORY_NAME === "rice" || props.food.CATEGORY_NAME === "pasta" ? "rice_pasta" : props.food.CATEGORY_NAME),props.food.FOOD, props.food.TYPES)}>
      <img className="combo_food_image" src={localpath + props.food.FOOD + '.png'} />
      <div className="combo_food_title">{props.food.FOOD_CHI_NAME ? props.food.FOOD_CHI_NAME : props.food.FOOD_ENG_NAME}</div>
      <div className="combo_food_price"><span>HKD {Number(props.food.PRICE).toFixed(1)}</span></div>
    </div>
  )
}

const ComboDetail = (props) => {
  let default_choices = props.choices.filter(choice => choice.TYPES === 'default')
  let upgrade_choices = props.choices.filter(choice => choice.TYPES === 'upgrade')
  if (props.category === 'rice/pasta') {
    default_choices = default_choices.filter(choice => choice.CATEGORY_NAME === 'rice' || choice.CATEGORY_NAME === 'pasta')
    upgrade_choices = upgrade_choices.filter(choice => choice.CATEGORY_NAME === 'rice' || choice.CATEGORY_NAME === 'pasta')
  } else {
    default_choices = default_choices.filter(choice => choice.CATEGORY_NAME === props.category)
    upgrade_choices = upgrade_choices.filter(choice => choice.CATEGORY_NAME === props.category)
  }
  let choices = default_choices.concat(upgrade_choices)
  let choices_list = choices.map(choice => <ComboFoodContainer food={choice} onclickComboFood={props.onclickComboFood} category_max={props.category_max} category_list={props.category_list} />)
  return (
    <li className="combo_food_li">
      <h1 style={{textDecoration: "underline"}}>{props.category === 'rice/pasta' ? "RICE/PASTA" : props.category.toUpperCase()}</h1>
      {choices_list}
    </li>
  )
}

export default class ClientComboChoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      'lang': 'eng',
      'food': '',
      'food_types': '',
      'food_category': '',
      'remark': false,
      'open': false, 
      'combo': '',
      'combo_info': {},
      'combo_choice': [],
      'combo_remark': [],
      'pizza': [],
      'rice_pasta': [],
      'starter': [],
      'drink': [],
      'extra': [],
      'combo_person': {'pizza': 0, 'rice_pasta': 0, 'starter': 0, 'drink': 0},
      'price': 0
    }
    this.getComboInfo = this.getComboInfo.bind(this)
    this.getComboChoice = this.getComboChoice.bind(this)
    this.getComboPerson = this.getComboPerson.bind(this)
    this.onclickComboFood = this.onclickComboFood.bind(this)
    this.closeRemark = this.closeRemark.bind(this)
    this.addFood = this.addFood.bind(this)
    this.orderOnSubmit = this.orderOnSubmit.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    return { 'open': props.open, 'combo': props.combo }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.combo != this.props.combo) {
      this.getComboInfo()
      this.getComboChoice()
      this.getComboPerson()
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

  getComboPerson() {
    fetch(`/api/combo_person?combo=${this.state.combo}`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          const data = result.combo_person
          const dict = {}
          for (let i = 0; i < data.length; i++) {
            dict[data[i].CATEGORY_NAME] = data[i].QUANTITY
          }
          this.setState(
            { 
              'combo_person': { 
                'pizza': dict.pizza, 
                'rice_pasta': dict.rice, 
                'starter': dict.starter, 
                'drink': dict.drink 
              } 
            }
          )
        })
      }
    })
  }
  onclickComboFood(category, id, types) {
    console.log(category, types)
    if (types !== 'extra') {
      if (this.state[category].length < this.state.combo_person[category]) {
        console.log('open remark','container'+id+types)
        this.setState({'remark': true, 'food': id, 'food_types': types, 'food_category': category})
      } else {
        console.log('Dont Add',id,types)
      }
    } else {
        this.setState({'remark': true, 'food': id, 'food_types': types, 'food_category': category})
    }
  }

  refreashPrice() {
    let new_price = this.state.combo_info.FOOD_PRICE
    const temp = this.state.pizza.concat(this.state.rice_pasta,this.state.starter,this.state.drink,this.state.extra)
    temp.forEach(food => {
      new_price += food.price
    })
    this.setState({ 'price': new_price }, () => console.log(new_price))
  }

  closeRemark() {
    if (this.state.remark === true) {
      this.setState({'remark': false})
    }
  }

  addFood(category,food,types,remark,price) {
    console.log(category,food,types,remark)
    let temp = this.state[category]
    if (types === 'extra') {
      temp = this.state.extra
      category = 'extra'
    }
    temp.push({'food': food, 'types': types, 'remark': remark, 'price': price})
    console.log(temp)
    this.setState({category: temp},() => this.refreashPrice())
  }

  orderOnSubmit() {
    let checking = true
    const checking_list = ['pizza','rice_pasta','starter','drink']
    checking_list.forEach(category => {
      if (this.state[category].length !== this.state.combo_person[category]) {
        checking = false
      }
    })

    if (checking) {
      const order = '00000003'
      const combo = this.state.combo
      const temp = this.state.pizza.concat(this.state.rice_pasta,this.state.starter,this.state.drink,this.state.extra)
      const output = {'order_combo': {'order': order, 'combo': combo, 'food': temp}}
      console.log(output)
    }
  }

  render() {
    const choices = this.state.combo_choice
    const category = ['pizza', 'rice/pasta', 'starter', 'drink']
    const combo_choices = category.map(c => <ComboDetail category={c} category_max={this.state.combo_person[(c === 'rice/pasta' ? 'rice_pasta' : c)]} category_list={this.state[(c === 'rice/pasta' ? 'rice_pasta' : c)]} choices={choices} onclickComboFood={this.onclickComboFood} />)
    const extra_choices = choices.filter(choice => choice.TYPES === 'extra')
    const extra_choices_list = extra_choices.map(choice => <ComboFoodContainer category_list={this.state.extra} food={choice} onclickComboFood={this.onclickComboFood}/>)
    return(
      <div className={this.state.open ? "ClientComboChoice ClientComboChoiceActive" : "ClientComboChoice"}>
        <div className="remark_title">
          <img src="https://img.icons8.com/carbon-copy/100/000000/back.png" onClick={this.props.choiceToggle} />
          <h1 onClick={()=> console.log(this.state)}>Combo</h1>
        </div>
        <img className="remark_img" src={this.state.combo != '' ? window.location.origin + '/static/image/food/' + this.state.combo + '.png' : ''} alt="combo image"/>
        <div className="remark_food_name">{this.state.lang === 'eng' ? this.state.combo_info.FOOD_ENG_NAME : this.state.combo_info.FOOD_CHI_NAME}</div>
        <ul className="remark_list">
          {combo_choices}
          <li className="combo_food_li">
            <h1 style={{textDecoration: "underline"}}>Extra</h1>
            {extra_choices_list}
          </li>
        </ul>
        <button className="bottom_btn" onClick={this.orderOnSubmit}>Add (HKD {this.state.price})</button>
        <ClientComboRemark open={this.state.remark} combo={this.state.combo} food={this.state.food} food_category={this.state.food_category} food_types={this.state.food_types} category_list={this.state[this.state.food_category]} food_person={this.state.combo_person[this.state.food_category]} closeRemark={this.closeRemark} addFood={this.addFood}/>
      </div>
    )
  }
}
