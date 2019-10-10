import React from 'react'

const ComboContainer = () => <div className="combo_container">
                           <img className="product_image" src="https://www.pizzahut.com.hk/menu/v000001/hk/en/images/B6087.png" />
                           <div className="product_title">Product A</div>
                           <div className="product_detail">
                             Details
                           </div>
                           <div className="product_price"><span>HKD ???.?</span></div>
                         </div>

export default class ClientCombo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [1,2,3,4] };
    this.loadData = this.loadData.bind(this);
  }
  
  componentDidMount() {
    this.loadData()
  }

  loadData() {
    console.log('combo')
  }
  render() {
    return(
      <div className="ClientCombo translateX-3">
        <ComboContainer/>
        <ComboContainer/>
        <ComboContainer/>
      </div>
    )
  }
}
