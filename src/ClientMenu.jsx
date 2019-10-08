import React from 'react'

export default class ClientMenu extends React.Component {
  render() {
    return(
        <ul className="ClientMenu translateX-3">
          <li>
            <img src="https://img.icons8.com/pastel-glyph/64/000000/pizza--v2.png"/>
            <div>Combo</div>
          </li>
          <li>
            <img src="https://img.icons8.com/ios/50/000000/pizza-five-eighths.png"/>
            <div>Pizza</div>
          </li>
          <li>
            <img src="https://img.icons8.com/wired/64/000000/rice-bowl.png"/>
            <div>Rice</div>
          </li>
          <li>
            <img src="https://img.icons8.com/wired/64/000000/spaghetti.png"/>
            <div>Pasta</div>
          </li>
          <li>
            <img src="https://img.icons8.com/carbon-copy/100/000000/fried-chicken.png"/>
            <div>Starter</div>
          </li>
          <li>
            <img src="https://img.icons8.com/pastel-glyph/64/000000/energy-sport-drink.png"/>
            <div>Drink</div>
          </li>
          <li>
            <img src="https://img.icons8.com/wired/64/000000/burger-dip.png"/>
            <div>Dessert</div>
          </li>
          <li>
            <img src="https://img.icons8.com/pastel-glyph/64/000000/beetroot-and-carrot-1.png"/>
            <div>Vegetarian</div>
          </li>
        </ul>
    )
  }
}

