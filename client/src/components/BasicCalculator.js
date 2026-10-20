// BasicCalculator.js
//IMPORT REQUIRED MODULES AND PACKAGES
import React, { useCallback, useEffect, useRef, useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/BasicCalculator.css';
import '../css/componentCss/CalculatorResults.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
// import Button from 'react-bootstrap/Button';
// IMPORT ICONS FROM LUCIDE-REACT
import { Equal } from 'lucide-react';
// IMPORT UTILITY FUNCTIONS
import {evaluateExpression, isCalculatorKey} from '../util/calculatorFunc';
// IMPORT CUSTOM COMPONENTS
import ButtonGrid from './ButtonGrid';


//Basic Calculator function component
export default function BasicCalculator() {//Export default BasicCalculator.js component
    // ========STATE VARIABLES==============
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

    //--------CALCULATOR  LOGIC------------
    // Memoized function that evaluates the mathematical expression
    const handleEquals = useCallback(() => {
        const { ok, value } = evaluateExpression(input)// Evaluate the mathematical expression using math.js

        //Conditional rendering to check the expression could be worked out
        if (!ok) {
            setResult('Error') // Display an error if the expression is invalid
            setLiveMessage('Invalid expression');// Announce the invalid expression
            return;// Exit the function early
        }

        setResult(value) // Display the calculated result
        setLiveMessage(`Result is ${value}`);// Announce the result for screen readers

    },[input])

    //Use Effect hook
    useEffect(() => {
        const handleKeyDown = (event) => {
            const activeEl = document.activeElement;
            const isOtherInput =
                activeEl &&
                (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') &&
                activeEl !== inputRef.current;
            if (isOtherInput) return;// Exit if another input has focus
            const { key } = event;
            // Accept numbers, decimal point and mathematical operators
            if (isCalculatorKey(key)) {
                handleClick(key, key);            // Treat keyboard input the same as clicking a calculator button
            } else if (key === 'Enter' || key === '=') {
                handleEquals();// Calculate the expression when Enter or '=' is pressed
            } else if (key === 'Escape' || key.toLowerCase() === 'c') { // Clear
                handleClear(); // Clear the calculator when Escape or 'C' is pressed
            } else if (key === 'Backspace') {     // Backspace
                handleBackspace();// Remove the last character when Backspace is pressed
            }
        }
        window.addEventListener('keydown', handleKeyDown);// Register the keyboard listener when the component mounts
        /*Remove the event listener when the component unmounts
        to prevent memory leaks and duplicate listeners*/
        return () => window.removeEventListener('keydown', handleKeyDown); // Cleanup on unmount

    },[handleEquals])

    //============JSX RENDERING==================
    return (
        <div id='calculatorLayout' aria-labelledby='calculator1Descrip'>
            {/* Screen-reader live region for announcing actions (hidden visually) */}
            {/* ------Screen Reader Heading----------- */}
            <p className='visually-hidden' id='calculator1Descrip'>BASIC CALCULATOR</p>
            <div aria-live='assertive' aria-atomic='true' className='visually-hidden'>
                {liveMessage}
            </div>
            <div id='basicCalculatorInput'>
            {/* CALCULATOR STACK */}
                <Stack gap={3} id='calculatorInputStack'>
                    <div className="p-2" id='calculatorInputBlock'>
                        <input
                            type='text'
                            className='input'
                            id='calculatorInput'
                            value={input}
                            tabIndex={0}
                            ref={inputRef}
                            readOnly
                            aria-label='current expression'
                            aria-readonly='true'
                        />
                        {/* ==========CALCULATOR 1: RESULT DISPLAY======== */}
                        <div id='result' tabIndex={-1} aria-live='polite' aria-atomic='true'>
                            {/* Result display with '=' prefix */}
                            <span id='calculator-output'>
                                <Equal fontWeight={800} size={24} style={{margin: '0px', padding: '0px'}} aria-hidden='true' focusable='false'/>
                                <h4 id='outputText'>{result}</h4>
                            </span>
                        </div>
                    </div>
                    <div className="p-2" id='calculatorBtnBlock'>
                        <ButtonGrid
                            handleBackspace={handleBackspace}
                            handleClick={handleClick}
                            handleEquals={handleEquals}
                            handleClear={handleClear}/>
                    </div>
                </Stack>
            </div>
        </div>
    )
}
