import React, { useState } from 'react'
import '../css/componentCss/FormSetup.css'
import '../css/componentCss/CalculatorResult.css'
import '../css/componentCss/VatCalculator.css'
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { Asterisk, Save } from 'lucide-react';
import { formatCurrency } from '../util/currencyFunc';
// SARS standard VAT rate. Centralised here so a future rate change
// (as nearly happened for 2025/2026) only needs updating in one place.
const SARS_VAT_RATE = 0.15;

const ZERO_RATED_CATEGORIES = [
  'Brown bread',
  'Maize meal',
  'Rice',
  'Vegetables',
  'Fruit',
  'Milk',
  'Eggs',
  'Vegetable oil',
  'Dried beans',
  'Lentils',
  'Paraffin',
  'Brown wheaten meal',
  'Pilchards/sardinella in tins',
];


export default function VatCalculator({currentUser}) {
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState('exclusive')
  const [isZeroRated, setIsZeroRated] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)


  const calculateVat = (rawAmount, calcMode, zeroRated) => {
    const rate = zeroRated ? 0 : SARS_VAT_RATE;

    let netAmount;
    let vatAmount;
    let grossAmount;

    if (calcMode === 'exclusive') {
      // User entered the amount excluding VAT — add VAT on top
      netAmount = rawAmount;
      vatAmount = netAmount * rate;
      grossAmount = netAmount + vatAmount;
    } else {
      // User entered the amount including VAT — strip VAT back out
      grossAmount = rawAmount;
      netAmount = rate === 0 ? grossAmount : grossAmount / (1 + rate);
      vatAmount = grossAmount - netAmount;
    }

    return {
      mode: calcMode,
      isZeroRated: zeroRated,
      ratePercent: rate * 100,
      netAmount: Number(netAmount.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2)),
      grossAmount: Number(grossAmount.toFixed(2)),
      calculatedAt: new Date().toISOString(),
    };
  };

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

  const runCalculation = (rawValue, calcMode, zeroRated) => {
    const parsed = parseFloat(rawValue);

    if (rawValue === '' || Number.isNaN(parsed)) {
      setResult(null);
      setError('');
      return;
    }

    if (parsed < 0) {
      setError('Amount cannot be negative.');
      setResult(null);
      return;
    }

    setError('');
    const calcResult = calculateVat(parsed, calcMode, zeroRated);
    setResult(calcResult);

    // if (onCalculate) {
      // onCalculate(calcResult);
    // }
  };

  // Function to save the VAT calculation
  // call the saveVatCalculation request function
  // const handleSave = () => {
    
  // }
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
