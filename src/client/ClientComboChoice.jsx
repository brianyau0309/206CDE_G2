import React from 'react'

const ComboFoodContainer = (props) => {
  const localpath = window.location.origin + '/static/image/food/'
  return(
    <div className="inline">
      <input type="checkbox" className="combo_food_checkbox" id={"checkbox"+props.food.FOOD+props.food.TYPES} />
      <div className="combo_food_container">
        <img className="combo_food_image" src={localpath + props.food.FOOD + '.png'} />
        <div className="combo_food_title">{props.food.FOOD_CHI_NAME ? props.food.FOOD_CHI_NAME : props.food.FOOD_ENG_NAME}</div>
        <div className="combo_food_price"><span>HKD {Number(props.food.PRICE).toFixed(1)}</span></div>
      </div>
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
  let choices_list = choices.map(choice => <ComboFoodContainer food={choice} />)
  return (
    <li className="combo_food_li">
      <h1 style={{textDecoration: "underline"}}>{choices.length > 0 ? props.category.toUpperCase() : null}</h1>
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
      'remark': false,
      'open': false, 
      'combo': '',
      'combo_info': {},
      'combo_choice': [],
      'combo_remark': [],
      'pizza': [],
      'rice_pasta': [],
      'stater': [],
      'drink': [],
      'extra': [],
      'qty': {'pizza': 0, 'rice_pasta': 0, 'starter': 0, 'drink': 0},
      'price': 0
    }
    this.getComboInfo = this.getComboInfo.bind(this)
    this.getComboChoice = this.getComboChoice.bind(this)
    this.getComboPerson = this.getComboPerson.bind(this)
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
          this.setState(
            { 
              'qty': { 
                'pizza': data[0].QUANTITY, 
                'rice_pasta': data[1].QUANTITY, 
                'starter': data[3].QUANTITY, 
                'drink': data[4].QUANTITY 
              } 
            }
          )
        })
      }
    })
  }

  render() {
    const choices = this.state.combo_choice
    const category = ['pizza', 'rice/pasta', 'starter', 'drink']
    const combo_choices = category.map(c => <ComboDetail category={c} choices={choices} />)
    const extra_choices = choices.filter(choice => choice.TYPES === 'extra')
    const extra_choices_list = extra_choices.map(choice => <ComboFoodContainer food={choice} />)
    return(
      <div className={this.state.open ? "ClientComboChoice ClientComboChoiceActive" : "ClientComboChoice"}>
        <div className="remark_title">
          <img src="https://img.icons8.com/carbon-copy/100/000000/back.png" onClick={this.props.choiceToggle} />
          <h1>Combo</h1>
        </div>
        <img className="remark_img" src={this.state.combo != '' ? window.location.origin + '/static/image/food/' + this.state.combo + '.png' : ''} alt="combo image"/>
        <div className="remark_food_name">{this.state.combo_info.FOOD_ENG_NAME}</div>
        <ul className="remark_list">
          {combo_choices}
        <li className="combo_food_li">
            <h1>Extra</h1>
            {extra_choices_list}
        </li>
        </ul>
        <button className="bottom_btn">Add (HKD {this.state.price})</button>
      </div>
    )
  }
}