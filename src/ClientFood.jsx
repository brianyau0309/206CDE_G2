import React from 'react'

const FoodContainer = (props) => (
  <div className="food_container">
    <img className="product_image" src="https://www.pizzahut.com.hk/menu/v000001/hk/tc/images/30.png" />
    <div className="product_title">{props.food.FOOD_CHI_NAME ? props.food.FOOD_CHI_NAME : props.food.FOOD_ENG_NAME}</div>
    <div className="product_detail">
      {props.food.DESCRIPTION_CHI ? props.food.DESCRIPTION_CHI : props.food.DESCRIPTION_ENG}
    </div>
    <div className="product_price"><span>HKD {Number(props.food.FOOD_PRICE).toFixed(1)}</span></div>
  </div>
)

export default class ClientFood extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 'food': [], 'category': '', 'lang': 'eng' };
    this.loadData = this.loadData.bind(this);
  }
  
  componentDidMount() {
    this.loadData()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params !== this.props.match.params) {
      this.loadData()
      if (this.state.lang != this.props.lang) {
        this.setState({ 'category': this.props.match.params.category, 'lang': this.props.lang }, () => this.loadData())
      }
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

  render() {
    const FoodList = this.state.food.map(food => <FoodContainer food={food}/>)
    return(
      <div className="ClientFood translateX-3">
        {FoodList}
        <div className="food_container placeholder"></div>
      </div>
    )
  }
}
