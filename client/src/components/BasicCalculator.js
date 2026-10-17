import React from 'react'
import '../css/componentCss/BasicCalculator.css'
import { Calculator } from 'lucide-react';

export default function BasicCalculator() {
  return (
    <div id='calculatorLayout' aria-labelledby='calculator1Descrip'>
    {/* Screen-reader live region for announcing actions (hidden visually) */}
        {/* ------Screen Reader Heading----------- */}
        <p className='visually-hidden' id='calculator1Descrip'>BASIC CALCULATOR</p>
        <div>
            basic Calculator
        </div>
    </div>
  )
}
