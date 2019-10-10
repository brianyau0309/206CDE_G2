import React from 'react'

const FoodContainer = (props) => {
  let category = props.category.toUpperCase()
  return (
    <div className="food_container">
      <img className="product_image" src="https://www.pizzahut.com.hk/menu/v000001/hk/tc/images/30.png"/>
        <div className="product_title">{category} A</div>
        <div className="product_detail">
          Details
        </div>
      <div className="product_price"><span>HKD ???.?</span></div>
     </div>
  )
}

export default class ClientFood extends React.Component {
  constructor(props) {
    super(props);
    this.state = { category: '' };
    this.loadData = this.loadData.bind(this);
  }
  
  componentDidMount() {
    this.loadData()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params !== this.props.match.params) {
      console.log(this.props.match.params.category)
      this.setState({ category: this.props.match.params.category })
    }
  }

  loadData() {
    console.log(this.props.match.params.category)
    this.setState({ category: this.props.match.params.category })
  }
  render() {
    return(
      <div className="ClientFood translateX-3">
        <FoodContainer category={this.state.category}/>
        <FoodContainer category={this.state.category}/>
        <FoodContainer category={this.state.category}/>
        <FoodContainer category={this.state.category}/>
        <FoodContainer category={this.state.category}/>
        <FoodContainer category={this.state.category}/>
        <FoodContainer category={this.state.category}/>
        <FoodContainer category={this.state.category}/>
        <div className="food_container placeholder"></div>
      </div>
    )
  }
}
