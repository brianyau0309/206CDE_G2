import React from 'react'

export default class Kitchen extends React.Component {
  constructor() {
    super()
    this.state = {
      'socket': '',
      'cook_list': []
    }
    this.loadCookList = this.loadCookList.bind(this)
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

  render() {
    return(
      <div className="Kitchen">
        <h1>Kitchen</h1>
      </div>
    )
  }
}