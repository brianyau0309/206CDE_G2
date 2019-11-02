import React from 'react'
import StaffComboChoice from './StaffComboChoice.jsx'

const ComboContainer = (props) => {
  const localpath = window.location.origin + '/static/image/food/'
  return (
    <div className="combo_container" onClick={() => props.choiceToggle(props.combo.FOOD_ID)}>
      <img className="product_image" src={localpath + props.combo.FOOD_ID + '.png'} />
      <div className="product_title">{props.combo.FOOD_CHI_NAME ? props.combo.FOOD_CHI_NAME : props.combo.FOOD_ENG_NAME}</div>
      <div className="product_detail">
        {props.combo.DESCRIPTION_CHI ? props.combo.DESCRIPTION_CHI : props.combo.DESCRIPTION_ENG}
      </div>
      <div className="product_price"><span>HKD {Number(props.combo.FOOD_PRICE).toFixed(1)}</span></div>
    </div>
  )
}

export default class StaffCombo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 'combo': [], 'lang': 'eng', 'combo_choosing': '','choice': false }
    this.loadData = this.loadData.bind(this)
    this.choiceToggle = this.choiceToggle.bind(this)
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

  choiceToggle(combo) {
    if (this.state.choice) {
      this.setState({ 'choice': false })
    } else {
      document.querySelector('.StaffComboChoice').scrollTo(0,0)
      this.setState({ 'combo_choosing': combo,'choice': true })
    }
  }

  render() {
    const ComboList = this.state.combo.map(combo => <ComboContainer combo={combo} choiceToggle={this.choiceToggle}/>)
    return(
      <div className="StaffCombo translateX-3" >
        {ComboList}
        <StaffComboChoice open={this.state.choice} combo={this.state.combo_choosing} choiceToggle={this.choiceToggle}/>
      </div>
    )
  }
}
