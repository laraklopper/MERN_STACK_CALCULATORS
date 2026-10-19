// VatCalculator.js
//IMPORT REQUIRED MODULES AND PACKAGES
import React, { useCallback, useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/FormSetup.css'
import '../css/componentCss/VatCalculator.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
// IMPORT ICONS FROM LUCIDE-REACT
import { Asterisk, Save } from 'lucide-react';
// IMPORT UTILITY FUNCTIONS
import { formatCurrency } from '../util/currencyFunc';
import { ZERO_RATED_CATEGORIES, SARS_VAT_RATE } from '../util/calculatorFunc';


// VatCalculator function component
export default function VatCalculator(//Export default VatCalculator.js component
  {//PROPS PASSED FROM PARENT COMPONENT (Tax.js)
    currentUser
  }) {
  // ========STATE VARIABLES==================
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState('exclusive')
  const [isZeroRated, setIsZeroRated] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)


 
  

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    runCalculation(value, mode, isZeroRated);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    runCalculation(amount, newMode, isZeroRated);
  };

  const handleZeroRatedToggle = (e) => {
    const checked = e.target.checked;
    setIsZeroRated(checked);
    runCalculation(amount, mode, checked);
  };

  // Function to calculate VAT
  const calculateVat = useCallback(async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('')
    } catch (error) {
      
    }
  },[])

  const saveCalculation = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
    } catch (error) {
      
    }
  },[])
  // / Function to submit vat calculation POST request
   const handleCalculation = useCallback(async (w) => {
    try {
      
    } catch (error) {
      
    }
  })
  
  // Function to save the VAT calculation
  // const handleSave = (e) => {
    
  // }
  
  /
  // ================JSX RENDERING===================
  return (
    <form id='vatCalculator' method='POST' /*onSubmit={}*/ aria-labelledby='formHeading'>
    {/* Heading */}
    <div id='vatCalcHeadingBlock'>
      <h3 id='formHeading'>VAT CALCULATOR</h3>
      <span className='formTextSpan'>
 <p className="formText">
        South African standard rate: {SARS_VAT_RATE * 100}% (SARS)
      </p>
      </span>
      </div>
      {/* CALCULATOR INPUT */}
      <div id='vatCalculatorInput'>
      {/* GROUP 1 */}
        <div id='vatFormGroup1'>
         <Stack gap={3} id='vatCalcStack1'>
         {/* VAT AMOUNT */}
      <div className="p-2" id='vatCalculatorBlock1'>
        <label className='calculatorLabel' id='vatAmount'>AMOUNT (ZAR):</label>
        <div className='inputDiv'>
          <input
            type='number'
            className='input'
            id='vatAmount'
            step="0.01"
            min="0"
            required
            name='amount'
            value={amount}
            onChange={handleAmountChange}
            placeholder='0.00'
            // ARIA ATTRIBUTES:
            aria-label='Vat amount'
            aria-required='true'
          />
          <small><Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
        </div>
      </div>
      <div className="p-2" id='vatCalculatorBlock2'>
        <label className="calculatorLabel" htmlFor=''>Calculation type:</label>
                      <div id='vatCalcBtnDiv'>
                <Button
                variant='light'
                type="button"
                id='vatCalcTypebtn1'
            className={`vat-calculator__toggle-btn ${
              mode === 'exclusive' ? 'vatCalculatorToggleBtn--active' : ''
            }`}
            onClick={() => handleModeChange('exclusive')}
                >
                  Add VAT (excl. → incl.)
                </Button>
                 <Button
                 variant='light'
            type="button"
            id='vatCalcTypebtn2'
            className={`vat-calculator__toggle-btn ${
              mode === 'inclusive' ? 'vat-calculator__toggle-btn--active' : ''
            }`}
            onClick={() => handleModeChange('inclusive')}
          >
            Remove VAT (incl. → excl.)
          </Button>
              </div>
      </div>
      <div className="p-2" id='vatCalculatorBlock3'>
        <input
          type='checkbox'
          id='vatZeroRated'
          className='vatCalculatorCheckbox'
          checked={isZeroRated}
          onChange={handleZeroRatedToggle}
        />
        <label className='calculatorLabel' htmlFor='vatZeroRated'>This item is zero rated</label>
      </div>
    </Stack>
        </div>
        {/* GROUP 2 */}
        <div id='vatFormGroup2'>
            {isZeroRated && (
        <p className="zeroRatedCategories">
          Common zero-rated items: {ZERO_RATED_CATEGORIES.join(', ')}.
        </p>
      )}
      {error && <p className="vatCalculatorError">{error}</p>}
        </div>
        {/* ----END OF INPUT------- */}
        {/* RESULTS */}
 {result && (
        <div>
          <div className="vat-calculator__result-row">
            <span>Amount excl. VAT</span>
            <span>{formatCurrency(result.netAmount)}</span>
          </div>
          <div className="vat-calculator__result-row">
            <span>VAT ({result.ratePercent}%)</span>
            <span>{formatCurrency(result.vatAmount)}</span>
          </div>
          <div className="vat-calculator__result-row vat-calculator__result-row--total">
            <span>Amount incl. VAT</span>
            <span>{formatCurrency(result.grossAmount)}</span>
          </div>
        </div>
      )}
      {currentUser ? (
        <Button
        variant='light'
        type='saveVatCalculationBtn'
        // onClick={handleSave}
        // ARIA ATTRIBUTES:
        // aria-label=''
        >
          <Save aria-hidden='true'  />SAVE CALCULATION
        </Button>
      ):(
        result && (
          <p className="vatCalculatorAuthHint">
            Log in to save this calculation to your history.
          </p>
        )
      )}
       </div>
    </form>
  )
}
