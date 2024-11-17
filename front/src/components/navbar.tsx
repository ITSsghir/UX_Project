import React from 'react'
// Import styles from the navbar.css file in the styles folder
import '../styles/navbar.css'

// Create a navbar component that has 3 buttons, each of which sets the visuSwitch state to a different value, it accepts the setVisuSwitch function as a prop
const Navbar = ({setVisuSwitch}: {setVisuSwitch: Function}) => {

  return (
    <div className='navbar'>
        <button onClick={() => setVisuSwitch('')} className='header'>Projet UX</button>
        <div className='container'>
            <button onClick={() => setVisuSwitch('visu1')} className='choice'>visu1</button>
            <button onClick={() => setVisuSwitch('visu2')} className='choice'>visu2</button>
            <button onClick={() => setVisuSwitch('visu3')} className='choice'>visu3</button>
        </div>
    </div>
  )
}

export default Navbar