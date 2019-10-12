import React from 'react'

const ComboContainer = (props) => (
  <div className="combo_container">
    <img className="product_image" src="https://www.pizzahut.com.hk/menu/v000001/hk/en/images/B6087.png" />
    <div className="product_title">{props.combo.name}</div>
    <div className="product_detail">
      {props.combo.description}
    </div>
    <div className="product_price"><span>HKD {props.combo.price}}</span></div>
  </div>
)

export default class ClientCombo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 'combo': [] }
    this.loadData = this.loadData.bind(this);
  }
  
  componentDidMount() {
    this.loadData()
  }

  loadData() {
    fetch(`/api/food/combo`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({ 'combo': result.food })
        })
      }
    })
  }

  render() {
    const ComboList = this.state.combo.map(combo => <ComboContainer combo={combo}/>)
    return(
      <div className="ClientCombo translateX-3">
        {ComboList}
      </div>
    )
  }
}
