import React from 'react'
import Sidebar from '../Component/Sidebar'
import Chat from '../Component/Chat'
import { useState } from 'react'
const Home = () => {


  return (
    <div className='home'>
      <div className="container-home">
         <Sidebar />
         <Chat />
      </div>
    </div>
  )
}

export default Home
