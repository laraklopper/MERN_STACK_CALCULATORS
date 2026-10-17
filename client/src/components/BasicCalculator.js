import React, { useState } from 'react'
import '../css/componentCss/BasicCalculator.css'


export default function BasicCalculator() {
    const [liveMessage, setLiveMessage] = useState()

  return (
    
    <div id='calculatorLayout' aria-labelledby='calculator1Descrip'>
    {/* Screen-reader live region for announcing actions (hidden visually) */}
        {/* ------Screen Reader Heading----------- */}
        <p className='visually-hidden' id='calculator1Descrip'>BASIC CALCULATOR</p>
         <div className='calculator-heading-block'>
            <h3 className='calculatorHeading'>CALCULATOR</h3>
        </div>
    </div>
  )
}
