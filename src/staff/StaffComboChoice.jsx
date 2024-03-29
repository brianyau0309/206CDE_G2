import React from 'react'
import StaffComboRemark from './StaffComboRemark.jsx'

const vocabulary_eng = {'remark': 'Remark','combo': 'Combo', 'pizza': 'Pizza', 'rice/pasta': 'Rice/Pasta', 'starter': 'Stater', 'drink': 'Drink', 'extra': 'Extra'}
const vocabulary_chi = {'remark': '備註', 'combo': '套餐', 'pizza': '薄餅', 'rice/pasta': '飯類/意粉', 'starter': '小食', 'drink': '飲品', 'extra': '額外'}

const ComboFoodContainer = (props) => {
  const localpath = window.location.origin + '/static/image/food/'
  let category_name = props.food.CATEGORY_NAME
  if (category_name === 'rice' || category_name === 'pasta') {category_name = 'rice_pasta'}
  return(
    <div className={props.category_max <= props.category_list.length && props.category_list.filter(item => item.food === props.food.FOOD).length === 0 ? "combo_food_container deactive" : props.category_list.filter(item => item.food === props.food.FOOD).length === 0 ? "combo_food_container" : "combo_food_container active"} onClick={() => props.onclickComboFood((props.food.CATEGORY_NAME === "rice" || props.food.CATEGORY_NAME === "pasta" ? "rice_pasta" : props.food.CATEGORY_NAME),props.food.FOOD, props.food.TYPES)}>
      <img className="combo_food_image" src={localpath + props.food.FOOD + '.png'} />
      <div className="combo_food_title">{props.lang === 'eng' ? props.food.FOOD_ENG_NAME : props.food.FOOD_CHI_NAME}</div>
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
  let choices_list = choices.map(choice => <ComboFoodContainer lang={props.lang} food={choice} onclickComboFood={props.onclickComboFood} category_max={props.category_max} category_list={props.category_list} />)
  return (
    <li className="combo_food_li">
      <h1 style={{textDecoration: "underline"}}>{props.lang === 'eng' ? vocabulary_eng[props.category] : vocabulary_chi[props.category]}<span style={{textDecoration: "none",}}>&nbsp;--&nbsp;{props.category_list.length}/{props.category_max}</span></h1>
      {choices_list}
    </li>
  )
}

export default class StaffComboChoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      'lang': 'eng',
      'food': '',
      'food_types': '',
      'food_category': 'pizza',
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
    this.selfCloseChoice = this.selfCloseChoice.bind(this)
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
    if (types === 'extra') {category = 'extra'}
    if (this.state[category].filter(f => f.food === id && f.types === types).length > 0) {
        this.setState({'remark': true, 'food': id, 'food_types': types, 'food_category': category})
    } else if (category !== 'extra') {
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
    console.log('after set state', this.state)
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

  addFood(category, food_list) {
    console.log(category, food_list)
    this.setState({ [category]: food_list },() => this.refreashPrice())
  }

  orderOnSubmit() {
    let ready = true
    const checking_list = ['pizza','rice_pasta','starter','drink']
    checking_list.forEach(category => {
      if (this.state[category].length !== this.state.combo_person[category]) {
        ready = false
      }
    })

    if (ready) {
      const order = this.props.order
      const combo = this.state.combo
      const temp = this.state.pizza.concat(this.state.rice_pasta,this.state.starter,this.state.drink,this.state.extra)
      const output = {'order_combo': {'order': order, 'combo': combo, 'food': temp}}
      console.log(output)

      fetch(`/api/combo_order_food`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({'order_combo': {'order': order, 'combo': combo, 'food': temp}})
      }).then(res => res.json().then(result => console.log(result))).then(() => this.selfCloseChoice())
    }
  }
   selfCloseChoice() {
     this.setState({'pizza': [], 'rice_pasta': [], 'starter': [], 'drink': [], 'extra': [], 'price': this.state.combo_info.FOOD_PRICE})
     this.props.loadBill(this.props.order)
     this.props.close()
   }

  render() {
    const choices = this.state.combo_choice
    const category = ['pizza', 'rice/pasta', 'starter', 'drink']
    const combo_choices = category.map(c => <ComboDetail lang={this.state.lang} category={c} category_max={this.state.combo_person[(c === 'rice/pasta' ? 'rice_pasta' : c)]} category_list={this.state[(c === 'rice/pasta' ? 'rice_pasta' : c)]} choices={choices} onclickComboFood={this.onclickComboFood} />)
    const extra_choices = choices.filter(choice => choice.TYPES === 'extra')
    const extra_choices_list = extra_choices.map(choice => <ComboFoodContainer lang={this.state.lang} category_list={this.state.extra} food={choice} onclickComboFood={this.onclickComboFood}/>)
    return(
      <div className={this.state.open ? "StaffComboChoice StaffComboChoiceActive" : "StaffComboChoice"}>
        <div className="remark_title">
          <img src="https://img.icons8.com/carbon-copy/100/000000/back.png" onClick={this.selfCloseChoice} />
          <h1 onClick={() => console.log(this.state)}>{this.state.lang === 'eng' ? vocabulary_eng.combo : vocabulary_chi.combo}</h1>
        </div>
        <img className="remark_img" src={this.state.combo != '' ? window.location.origin + '/static/image/food/' + this.state.combo + '.png' : ''} alt="combo image"/>
        <div className="remark_food_name">{this.state.lang === 'eng' ? this.state.combo_info.FOOD_ENG_NAME : this.state.combo_info.FOOD_CHI_NAME}</div>
        <ul className="remark_list">
          {combo_choices}
          <li className="combo_food_li">
            <h1 style={{textDecoration: "underline"}}>{this.state.lang === 'eng' ? vocabulary_eng.extra : vocabulary_chi.extra }</h1>
            {extra_choices_list}
          </li>
        </ul>
        <button className="bottom_btn" onClick={this.orderOnSubmit}>{this.state.lang === 'eng' ? 'Add' : '加入'} (HKD {this.state.price})</button>
        <StaffComboRemark lang={this.state.lang} open={this.state.remark} combo={this.state.combo} food={this.state.food} food_category={this.state.food_category} food_types={this.state.food_types} category_list={this.state[this.state.food_category]} extra_list={this.state.extra} food_person={this.state.combo_person[this.state.food_category]} closeRemark={this.closeRemark} addFood={this.addFood} />
      </div>
    )
  }
}
