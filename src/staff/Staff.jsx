import React from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect, withRouter } from 'react-router-dom'


const FoodContainer = (props) => {
  return(
    <div>
    <label id='food'>{props.food.FOOD_ENG_NAME}</label>
    <button id='food' onClick={() => props.remarkToggle(props.food.FOOD_ID)}/>
    </div>
  )
  }
export default class Staff extends React.Component {
  constructor() {
    super()
    this.state = { 'staff': null, 
    'lang': 'eng', 
    'food':'',
    'food_info': {},
    'remark': false,
    'food_remark': [],
    'order_remark': [],
    'price': 0}
    this.login = this.login.bind(this)
    this.getStaffInfo = this.getStaffInfo.bind(this)
    this.getFoodInfo = this.getFoodInfo.bind(this)
    this.getFoodRemark = this.getFoodRemark.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.remarkOnChange = this.remarkOnChange.bind(this)
  }

  componentDidMount() {
    var socket = io.connect(window.location.origin)
      
    socket.on('connect', function() {
      socket.send('User has connected!');
    });
    
    socket.on('message', function(msg) {
      console.log(msg);
    });
  }

  login() {
    fetch(`/login`, {
      method: 'POST'
    }).then(res => {
      if (res.ok) {
        res.json().then(loginResult => {
          if (loginResult.login === 'success') {
            this.getStaffInfo()
          }
        })
      }
    })
  }

  getOrderID() {
    fetch(`/api/orderID`,{method: 'POST'}).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({ 'orderID': result.food_remark })
        })
      }
    })
  }

  getStaffInfo() {
    fetch(`/myinfo`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include'
    }).then(res => {
      if (res.ok) {
        res.json().then(info => {
          this.setState({ 'staff': info.staff_id, 'lang': this.state.lang })
        })
      }
    })
  }

  getFoodInfo() {
    fetch(`/api/food?food=${this.state.food}`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({ 'food_info': result.food[0], 'price': result.food[0].FOOD_PRICE })
        })
      }
    })
  }

  getFoodRemark() {
    fetch(`/api/food_remark?food=${this.state.food}`).then(res => {
      if (res.ok) {
        res.json().then(result => {
          this.setState({ 'food_remark': result.food_remark })
        })
      }
    })
  }

  remarkOnChange() {
    let temp = []
    let remark_option = document.querySelectorAll('.remark_list input')
    remark_option.forEach(option => {
      if (option.checked)
        temp.push(option.value)
    })
    this.setState({ 'order_remark': temp }, () => this.calPrice())
  }

  onSubmit() {
    let order = '00000003'
    let food = this.state.food
    let remark = this.state.order_remark
    fetch(`/api/order_food`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({'new_order': {'order': order, 'food': food, 'remark': remark}})
    }).then(res => res.json().then(result => console.log(result.ordering)))
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
    let all_remark = this.state.food_remark
    const remark_list = []

    while (all_remark.length != 0) {
      let remark_name = all_remark[0].REMARK
      remark_list.push(all_remark.filter(remark => remark.REMARK === remark_name))
      all_remark = all_remark.filter(remark => remark.REMARK !== remark_name)
    }

    const remark_component = remark_list.map(remark => (
      <li>
        <h1>{remark[0].REMARK}</h1>
          {
            remark.map(remark => 
            (
              <label>
                {remark.OPTION_ENG}
                <input type="radio" name={remark.REMARK} value={remark.REMARK_ID} onChange={this.remarkOnChange} />
              </label>)
            )
          }
      </li>
    ))

    return(
      <div className="Staff">
        <input id="side_toggle" type="checkbox" />
        <label for="side_toggle" className="cover"></label>
        <input id="bill_toggle" type="checkbox" />
        <label for="bill_toggle">
          <img id="bill_btn" src="https://img.icons8.com/carbon-copy/100/000000/bill.png" alt="Bill Toggle Button" />
        </label>
        <StaffTop />
        <Router>
          <div className="StaffMain translateX-3">
          <Switch>
          <input id="searchthing" type="text" placeholder="Search table"></input>
          {FoodList}
          <label for="combo_id">Combo_id</label>
          <input id="combo_id" />
          <Route path="/staff/food/combo">
            <StaffCombo lang={this.state.lang} />
              </Route>
              <Route path="/staff/food/:category" render={(props) => <StaffFood {...props} lang={this.state.lang} />}/>
              <Redirect from="/staff" to="/staff/food/combo" />  
          <label for="order_id">Order_id</label>
          <input id="order_id" />
          <label for="remark">remark</label>
          <ul className="remark_list">
          {remark_component}
          </ul>
          <button onClick={this.onSubmit}>Submit ({this.state.price})</button>
          </Switch>
          </div>
        </Router>
      </div>
    )
  }
}
