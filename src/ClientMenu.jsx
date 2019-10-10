import React from 'react'
import { NavLink } from 'react-router-dom'

export default class ClientMenu extends React.Component {
  render() {
    return(
        <ul className="ClientMenu translateX-3">
          <NavLink to="/client/food/combo">
            <li>
              <img src="https://img.icons8.com/pastel-glyph/64/000000/pizza--v2.png"/>
              <div>Combo</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/pizza">
            <li>
              <img src="https://img.icons8.com/ios/50/000000/pizza-five-eighths.png"/>
              <div>Pizza</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/rice">
            <li>
              <img src="https://img.icons8.com/wired/64/000000/rice-bowl.png"/>
              <div>Rice</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/pasta">
            <li>
              <img src="https://img.icons8.com/wired/64/000000/spaghetti.png"/>
              <div>Pasta</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/starter">
            <li>
              <img src="https://img.icons8.com/carbon-copy/100/000000/fried-chicken.png"/>
              <div>Starter</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/drink">
            <li>
              <img src="https://img.icons8.com/pastel-glyph/64/000000/energy-sport-drink.png"/>
              <div>Drink</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/dessert">
            <li>
              <img src="https://img.icons8.com/wired/64/000000/burger-dip.png"/>
              <div>Dessert</div>
            </li>
          </NavLink>
          <NavLink to="/client/food/vegetarian">
            <li>
              <img src="https://img.icons8.com/pastel-glyph/64/000000/beetroot-and-carrot-1.png"/>
              <div>Vegetarian</div>
            </li>
          </NavLink>
        </ul>
    )
  }
}

