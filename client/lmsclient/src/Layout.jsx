
import React from 'react' 


import { useState } from 'react'
import { Outlet ,NavLink } from 'react-router-dom'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <Outlet/>
    </>
  )
}

export default App
