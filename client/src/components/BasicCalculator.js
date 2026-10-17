import React, { useCallback, useRef, useState } from 'react'
import '../css/componentCss/BasicCalculator.css'
// import { evaluate } from 'mathjs';
import '../css/componentCss/BasicCalculator.css'


export default function BasicCalculator() {
    const [liveMessage, setLiveMessage] = useState('')
    const [result, setResult] = useState('')
    const [input, setInput] = useState('')

    const inputRef = useRef(null)

     //Function to handles button clicks from ButtonGrid
    const handleClick = (value, label) => {
        setInput((prev) => prev + value)// Append the selected value to the current mathematical expression
        setLiveMessage(`${label} pressed`)// Announce the pressed button for screen readers
    }
    // Function to clear expression + result and announces the action
    const handleClear = () => {
        setInput('');                           // Clear the current expression
        setResult('');                           // Clear the calculated result
        setLiveMessage('Calculator cleared');    // Announce the action for screen readers
    };

    // Function to remove the last character from the current expression
    const handleBackspace = () => {
        setInput((prev) => prev.slice(0, -1));   // Remove the final character from the input string
        setLiveMessage('Backspace pressed');     // Announce the action for screen readers
    };

    const handleEquals = useCallback(() => {
        try {
            
        } catch (error) {
            
        }
    },[])
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
