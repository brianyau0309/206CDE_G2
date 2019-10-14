import React from 'react'

const ComboContainer = (props) => (
  <div className="combo_container">
    <img className="product_image" src="https://www.pizzahut.com.hk/menu/v000001/hk/en/images/B6087.png" />
    <div className="product_title">{props.combo.FOOD_CHI_NAME ? props.combo.FOOD_CHI_NAME : props.combo.FOOD_ENG_NAME}</div>
    <div className="product_detail">
      {props.combo.DESCRIPTION_CHI ? props.combo.DESCRIPTION_CHI : props.combo.DESCRIPTION_ENG}
    </div>
    <div className="product_price"><span>HKD {Number(props.combo.FOOD_PRICE).toFixed(1)}</span></div>
  </div>
)

export default class ClientCombo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 'combo': [], 'lang': 'eng' }
    this.loadData = this.loadData.bind(this)
  }
  
  componentDidMount() {
    this.loadData()
  }

  componentDidUpdate() {
    if (this.state.lang != this.props.lang) {
      this.loadData()
      if (this.state.lang === 'eng') {
        this.setState({ 'lang': 'chi' })
      } 
      if (this.state.lang === 'chi') {
        this.setState({ 'lang': 'eng' })
      }
    }
  }

  loadData() {
    fetch(`/api/food/combo?lang=${this.props.lang}`).then(res => {
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
