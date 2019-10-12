import React from 'react'
import { NavLink } from 'react-router-dom'

const vocabulary_eng = {'Lang': 'English', 'Combo': 'Combo', 'Pizza': 'Pizza', 'Rice': 'Rice', 'Pasta': 'Pasta', 'Starter': 'Stater', 'Drink': 'Drink', 'Dessert': 'Dessert', 'Vegetarian': 'Vegetarian'}
const vocabulary_chi = {'Lang': '中文',　'Combo': '套餐', 'Pizza': '薄餅', 'Rice': '飯類', 'Pasta': '意粉', 'Starter': '小食', 'Drink': '飲品', 'Dessert': '甜點', 'Vegetarian': '素食'}

export default class ClientMenu extends React.Component {
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
        <ul className="ClientMenu translateX-3">
          <NavLink to="/client/food/combo">
            <li>
              <img src="https://img.icons8.com/pastel-glyph/64/000000/pizza--v2.png"/>
              <div>{this.state.vocabulary.Combo}</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/pizza">
            <li>
              <img src="https://img.icons8.com/ios/50/000000/pizza-five-eighths.png"/>
              <div>{this.state.vocabulary.Pizza}</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/rice">
            <li>
              <img src="https://img.icons8.com/wired/64/000000/rice-bowl.png"/>
              <div>{this.state.vocabulary.Rice}</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/pasta">
            <li>
              <img src="https://img.icons8.com/wired/64/000000/spaghetti.png"/>
              <div>{this.state.vocabulary.Pasta}</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/starter">
            <li>
              <img src="https://img.icons8.com/carbon-copy/100/000000/fried-chicken.png"/>
              <div>{this.state.vocabulary.Starter}</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/drink">
            <li>
              <img src="https://img.icons8.com/pastel-glyph/64/000000/energy-sport-drink.png"/>
              <div>{this.state.vocabulary.Drink}</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/dessert">
            <li>
              <img src="https://img.icons8.com/wired/64/000000/burger-dip.png"/>
              <div>{this.state.vocabulary.Dessert}</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/vegetarian">
            <li>
              <img src="https://img.icons8.com/pastel-glyph/64/000000/beetroot-and-carrot-1.png"/>
              <div>{this.state.vocabulary.Vegetarian}</div>
            </li>
          </NavLink>
        </ul>
    )
  }
}

