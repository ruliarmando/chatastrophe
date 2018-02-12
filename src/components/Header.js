import React from 'react'

const Header = (props) => (
  <div id="Header">
    <img src="/assets/icon.png" alt="Icon"/>
    <h1>Chatastrophe</h1>
    {props.children}
  </div>
)

export default Header
