import React from 'react'

export default class StaffTop extends React.Component {
  render() {
    const togglePng = window.location.origin + '/static/image/staff/toggle.png'
    const logoPng = window.location.origin + "/static/image/staff/header.png"
    return(
      <div className="StaffTop translateX-3">
        <label for="side_toggle">
          <img id="side_btn" src={togglePng} alt="Side Toggle Button" />
        </label>
        <img id="logo" src={ logoPng } alt="Pizza Hut" />
      </div>
    )
  }
}

