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
import { AlertCircle, Asterisk, Calculator, RotateCcw, Save } from 'lucide-react';
// IMPORT UTILITY FUNCTIONS
import { formatCurrency } from '../util/currencyFunc';
import { ZERO_RATED_CATEGORIES, SARS_VAT_RATE } from '../util/calculatorFunc';

// Upper bound on the amount, mirroring MAX_AMOUNT in vatRoutes.js
const MAX_AMOUNT = 1_000_000_000;

/* Function to send a POST request to /vat/<path> with the logged in user's token.
Shared by calculateVat and saveCalculation, which post the same body.
Returns the parsed response, or throws with the server's message. */
const postVat = async (path, payload) => {
  const token = localStorage.getItem('token')
  // Send a POST request to the /vat/<path> endpoint
  const response = await fetch(`http://localhost:3001/vat/${path}`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`// Attach the token in the Authorization header
    },
    body: JSON.stringify(payload)
  })
  const data = await response.json().catch(() => ({}));// Safely parse the JSON response (avoid crash if server returns non-JSON)

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data
}

// VatCalculator function component
export default function VatCalculator(//Export default VatCalculator.js component
  {//PROPS PASSED FROM PARENT COMPONENT (Tax.js)
    currentUser
  }) {
  // ========STATE VARIABLES==================
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState('exclusive') // 'exclusive' | 'inclusive'
  const [isZeroRated, setIsZeroRated] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null) // null | 'calculating'
  const [saveStatus, setSaveStatus] = useState(null) // null | 'saving' | 'saved' | 'error'
  const [saveMessage, setSaveMessage] = useState('')

  /* Bootstrap variant for the save button, so its colour reports the outcome
  of the save rather than staying neutral once the button is disabled. */
  const saveButtonVariant =
    saveStatus === 'saved' ? 'success' : saveStatus === 'error' ? 'danger' : 'light';

  /* Any change to the inputs makes the result on screen out of date, so it is
  cleared rather than left showing figures for a different question. */
  const clearResult = () => {
    setResult(null);
    setError(null);
    setSaveStatus(null);
    setSaveMessage('');
  };

  // =============EVENT LISTENERS=============
  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    clearResult();
  };

  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    clearResult();
  };

  const handleZeroRatedToggle = (e) => {
    setIsZeroRated(e.target.checked);
    clearResult();
  };

  //Function to reset the form
  const resetForm = () => {
    setAmount('');
    setMode('exclusive');
    setIsZeroRated(false);
    setStatus(null);
    clearResult();
  };

  //=======REQUEST FUNCTION HANDLERS===========
  /* Function to calculate VAT: sends a POST request to /vat/calculate.
  Returns the calculated result, or throws with the server's message. */
  const calculateVat = useCallback(async (payload) => {
    try {
      const data = await postVat('calculate', payload)
      return data.result
    } catch (error) {
      console.error('[ERROR: VatCalculator.js, calculateVat]: Error calculating VAT:', error.message);//Log an error message in the console for debugging purposes
      throw error
    }
  },[])

  /* Function to save a VAT calculation: sends a POST request to /vat/save.
  Returns the server's response, or throws with the server's message. */
  const saveCalculation = useCallback(async (payload) => {
    try {
      return await postVat('save', payload)
    } catch (error) {
      console.error('[ERROR: VatCalculator.js, saveCalculation]: Error saving VAT calculation:', error.message);//Log an error message in the console for debugging purposes
      throw error
    }
  },[])

  /* Function to submit the vat calculation form: validates the amount, then
  calls calculateVat which posts to /vat/calculate. */
  const handleCalculation = useCallback(async (e) => {
    e.preventDefault()

    const value = parseFloat(amount);
    // Conditional rendering to stop the request when the amount is unusable
    if (amount === '' || !Number.isFinite(value) || value < 0 || value > MAX_AMOUNT) {
      setError(`Enter an amount between 0 and ${formatCurrency(MAX_AMOUNT)}.`);
      setResult(null);
      return;
    }

    setStatus('calculating');
    setError(null);
    setResult(null);
    try {
      const calculated = await calculateVat({ amount: value, mode, isZeroRated });
      setResult(calculated);
    } catch (error) {
      setError(error.message || 'Could not calculate VAT. Try again.');
    } finally {
      setStatus(null);
    }
  },[amount, mode, isZeroRated, calculateVat])

  /* Function to handle the save calculation button: posts the inputs of the
  result on screen to /vat/save. The server recalculates from them, so the
  saved record cannot differ from what was shown. */
  const handleSave = useCallback(async (e) => {
    e.preventDefault()
    // Conditional rendering to make sure there is a calculation to save
    if (!result) return;

    setSaveStatus('saving');
    setSaveMessage('');
    try {
      const data = await saveCalculation({
        amount: result.amount,
        mode: result.mode,
        isZeroRated: result.isZeroRated,
      });
      setSaveStatus('saved');
      setSaveMessage(data?.message || 'Calculation saved to your history');
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage(error.message || 'Could not save. Try again.');
    }
  },[result, saveCalculation])

  // ================JSX RENDERING===================
  return (
    <form id='vatCalculator' method='POST' onSubmit={handleCalculation} aria-labelledby='formHeading'>
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
        <label className='calculatorLabel' htmlFor='vatAmount'>AMOUNT (ZAR):</label>
        <div className='inputDiv'>
          <input
            type='number'
            className='input'
            id='vatAmount'
            step="0.01"
            min="0"
            max={MAX_AMOUNT}
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
      {/* CALCULATION TYPE */}
      <div className="p-2" id='vatCalculatorBlock2'>
        <label className="calculatorLabel" htmlFor='vatCalcTypebtn1'>Calculation type:</label>
        <div id='vatCalcBtnDiv'>
          <Button
            variant='light'
            type="button"
            id='vatCalcTypebtn1'
            className={`vatCalculatorToggleBtn${
              mode === 'exclusive' ? ' vatCalculatorToggleBtn--active' : ''
            }`}
            onClick={() => handleModeChange('exclusive')}
            // ARIA ATTRIBUTES:
            aria-pressed={mode === 'exclusive'}
          >
            Add VAT (excl. → incl.)
          </Button>
          <Button
            variant='light'
            type="button"
            id='vatCalcTypebtn2'
            className={`vatCalculatorToggleBtn${
              mode === 'inclusive' ? ' vatCalculatorToggleBtn--active' : ''
            }`}
            onClick={() => handleModeChange('inclusive')}
            // ARIA ATTRIBUTES:
            aria-pressed={mode === 'inclusive'}
          >
            Remove VAT (incl. → excl.)
          </Button>
        </div>
      </div>
   
    </Stack>
        </div>
        {/* GROUP 2 */}
        <div id='vatFormGroup2'>
        <Stack gap={3}>
         {/* ZERO RATED */}
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
       {isZeroRated && (
            <div className="p-2">
            <p className="zeroRatedCategories">
              Common zero-rated items: {ZERO_RATED_CATEGORIES.join(', ')}.
            </p>
            </div>
          )}
          {error && (
            <div className="p-2">
              <p className="vatCalculatorError" role='alert'>
                <AlertCircle size={16} color='#C22419' aria-hidden='true' focusable='false' /> {error}
              </p>
            </div>
          )}
    </Stack>
        </div>
        {/* BUTTONS */}
        <div className="vatFormActions">
           <Stack gap={3} id='vatFormBtnStack'>
              <div className="p-2" id='requiredCalcInput'>
                <span className='reqCalcInputSpan'>
              <small><Asterisk color="#C22419" fontWeight={700} size={14} aria-hidden='true' focusable='false' /></small>
                  <p className='reqInputText' aria-hidden='true'>
                    Indicates required information
                  </p>
                  </span>
              </div>
              <div className="p-2" id='formSubmitBlock'>
              <Button
                variant='light'
                type='submit'
                id='submitCalculatorBtn'
                disabled={status === 'calculating'}
                // ARIA ATTRIBUTES:
                aria-disabled={status === 'calculating'}
              >
                <Calculator size={16} aria-hidden='true' focusable='false' />
                {status === 'calculating' ? 'Calculating...' : 'Calculate'}
              </Button>
            </div>
            <div className="p-2" id='clearCalculatorBlock'>
              <Button variant='danger' type='button' onClick={resetForm} id='clearCalculatorBtn'>
                  <RotateCcw size={16} fontWeight={700} aria-hidden='true' focusable='false' /> Reset
              </Button>
            </div>
           </Stack>
        </div>
        {/* ----END OF INPUT------- */}
        {/* RESULTS */}
        {result && (
          <div id='vatCalculatorResults' aria-live='polite'>
            <div className="vatCalculatorResultRow">
              <span>Amount excl. VAT</span>
              <span>{formatCurrency(result.netAmount)}</span>
            </div>
            <div className="vatCalculatorResultRow">
              <span>VAT ({result.ratePercent}%)</span>
              <span>{formatCurrency(result.vatAmount)}</span>
            </div>
            <div className="vatCalculatorResultRow vatCalculatorResultRow--total">
              <span>Amount incl. VAT</span>
              <span>{formatCurrency(result.grossAmount)}</span>
            </div>
          </div>
        )}
        {result && (currentUser ? (
          <div id='vatSaveRow'>
            <Button
              /* Turns green once the calculation is safely in the user's
              history, red when the save was rejected. */
              variant={saveButtonVariant}
              type='button'
              id='saveVatCalculationBtn'
              onClick={handleSave}
              disabled={saveStatus === 'saving' || saveStatus === 'saved'}
              // ARIA ATTRIBUTES:
              aria-label='Save VAT calculation to your history'
              aria-disabled={saveStatus === 'saving' || saveStatus === 'saved'}
            >
              <Save aria-hidden='true' focusable='false' />
              {saveStatus === 'saving'
                ? 'SAVING...'
                : saveStatus === 'saved'
                ? 'SAVED TO HISTORY'
                : 'SAVE CALCULATION'}
            </Button>
            {saveStatus === 'error' && (
              <span className='vatCalculatorError' role='alert'>{saveMessage}</span>
            )}
            {saveStatus === 'saved' && saveMessage && (
              <span className='vatSaveSuccess' role='status'>{saveMessage}</span>
            )}
          </div>
        ) : (
          <p className="vatCalculatorAuthHint">
            Log in to save this calculation to your history.
          </p>
        ))}
      </div>
    </form>
  )
}
