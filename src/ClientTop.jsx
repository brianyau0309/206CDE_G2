import React from 'react'

export default class ClientTop extends React.Component {
  render() {
    return(
      <div className="ClientTop translateX-3">
        <label for="side_toggle">
          <img id="side_btn" src="/image/client/toggle.png" alt="Side Toggle" />
        </label>
        <img id="logo" src="/image/client/header.png" alt="Pizza Hut" />
      </div>
    )
  }
}

