import React from 'react'
import StaffFoodRemark from './StaffFoodRemark.jsx'

const FoodContainer = (props) => {
  const localpath = window.location.origin + '/static/image/food/'
  return(
    <div className="food_container" onClick={() => props.remarkToggle(props.food.FOOD_ID)}>
      <img className="product_image" src={localpath + props.food.FOOD_ID + '.png'} />
      <div className="product_title">{props.food.FOOD_CHI_NAME ? props.food.FOOD_CHI_NAME : props.food.FOOD_ENG_NAME}</div>
      <div className="product_detail">
        {props.food.DESCRIPTION_CHI ? props.food.DESCRIPTION_CHI : props.food.DESCRIPTION_ENG}
      </div>
      <div className="product_price"><span>HKD {Number(props.food.FOOD_PRICE).toFixed(1)}</span></div>
    </div>
  )
}
export default class StaffFood extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      'food': [], 
      'category': '',
      'food_remark': '',
      'remark': false,
      'lang': 'eng' 
    }
    this.loadData = this.loadData.bind(this)
    this.remarkToggle = this.remarkToggle.bind(this)
  }
  
  componentDidMount() {
    this.loadData()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.category){
      if (prevProps.match.params.category !== this.props.match.params.category) {
        this.loadData()
      }
    }
    if (this.state.lang != this.props.lang) {
      this.setState({ 'category': this.props.match.params.category, 'lang': this.props.lang }, () => this.loadData())
    }
  }

  loadData() {
    fetch(`/api/food/${this.props.match.params.category}?lang=${this.props.lang}`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({ 'food': result.food })
        })
      }
    })
  }

  remarkToggle(food_id) {
    if (this.state.remark) {
      this.setState({ 'remark': false })
    } else {
      this.setState({ 'food_remark': food_id,'remark': true })
    }
  }

  render() {
    const FoodList = this.state.food.map(food => <FoodContainer food={food} remarkToggle={this.remarkToggle} />)
    return(
      <div className="StaffFood translateX-3">
        {FoodList}
        <div className="food_container placeholder"></div>
        <div className="food_container placeholder option"></div>
        <StaffFoodRemark open={this.state.remark} food={this.state.food_remark} remarkToggle={this.remarkToggle} />
      </div>
    )
  }
}
