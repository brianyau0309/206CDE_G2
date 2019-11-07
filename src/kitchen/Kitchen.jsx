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
    fetch()
  }

  render() {
    return(
      <div className="Kitchen">
      </div>
    )
  }
}