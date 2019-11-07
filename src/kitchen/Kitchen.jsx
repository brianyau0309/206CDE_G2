import React from 'react'

export default class Kitchen extends React.Component {
  constructor() {
    super()
    this.state = {
      'socket': '',
      'cook_list': []
    }
    this.loadCookList = this.loadCookList.bind(this)
    this.finishCook = this.finishCook.bind(this)
  }

  componentDidMount() {
    let socket = io.connect(window.location.origin)
    this.setState({'socket': socket})
    this.loadCookList()
  }

  loadCookList() {
    fetch(`/api/cook_list`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({'cook_list': result.cook_list})
        })
      }
    })
  }

  finishCook(order, food, seq) {
    fetch(`/finish_cook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({'cooked': {'orderID': order, 'food': food, 'sequence': seq}})
    }).then(res => {
      if (res.ok) {
        res.json().then(result => {
          console.log(result)
          this.loadCookList()
        })
      }
    })
  }

  render() {
    return(
      <div className="Kitchen">
        <h1>Kitchen</h1>
        <div className="cook_list">
        {
          this.state.cook_list.map(food => 
            <div className="kitchen_container">
              <div>
                <div>Food:</div> 
                <div style={{paddingLeft: '2vw'}}>{food.FOOD_CHI_NAME}</div>
                <div>Remark:</div>
                {
                  food.REMARK.map(remark => 
                    <div style={{paddingLeft: '2vw'}}>{remark.REMARK_CHI}</div>)
                }
              </div>
              <button className="finish_btn" onClick={() => this.finishCook(food.ORDERS, food.FOOD, food.ORDER_SEQUENCE)}>Finish</button>
            </div>)
        }
        </div>
      </div>
    )
  }
}