import React from 'react'

const Navbar = () => {
  return (
    <div className='navbar'>
       <span className='logo'>Application</span>
       <div className="user">
        <img src="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" alt="" />
        <span>Aman</span>
        <button className='logout'>LogOut</button>
       </div>
    </div>
  )
}

export default Navbar
