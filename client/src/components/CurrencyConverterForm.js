//CurrencyConverterForm.js
//IMPORT REQUIRED MODULES AND PACKAGES
import React, { useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/CurrencyConverter.css'
import '../css/componentCss/FormSetup.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
// IMPORT ICONS FROM LUCIDE REACT
import { Asterisk, RotateCcw } from 'lucide-react';
// IMPORT UTILITY FUNCTIONS
import { currencyOptionLabel, toQuotedRate, toConvertedAmount } from '../util/currencyFunc';

//CurrencyConverterForm function component.js
export default function CurrencyConverterForm(//Export default CurrencyConverterForm.js component
  {//PROPS PASSED FROM PARENT COMPONENT(Converter.js)
    form,
    setForm,
    setError,
    result,
    setResult,
    EMPTY_CONVERT_FORM,
    currencyOptions = [],
    loading,
    saveConversion,
    submitConvert,
    error
  }
) {
  /* Status of the save request for the conversion currently on screen:
  null | 'saving' | 'saved' | 'error'. Kept here rather than on the page
  because it describes this button, not the conversion itself. */
  const [saveStatus, setSaveStatus] = useState(null);
  // Message from a failed save, so the user sees why it was rejected
  const [saveError, setSaveError] = useState('');

  //===========EVENT LISTENERS===============
  /* Clears the save button back to its unsaved state. Called whenever the
  result on screen is replaced, so a 'Saved' label can never be left over from
  a previous conversion. */
  const resetSaveStatus = () => {
    setSaveStatus(null);
    setSaveError('');
  };

  const handleChange = (e) => {
    const {name, value} = e.target.value
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
    setResult(null)
    setError('')
    resetSaveStatus()
  }

  const handleConvert = (event) => {
    event.preventDefault()
    resetSaveStatus()
    submitConvert()
  }

  /* Function to save the displayed conversion to the user's history. The
  result is passed straight through, so the record is built from the figures
  on screen rather than from the inputs, which may have moved on. */
  const handleSave = async () => {
    if (!result || !saveConversion) return;// Nothing to save, or the page did not supply a handler
    setSaveStatus('saving');
    setSaveError('');
    try {
      await saveConversion({ amount: result.amount, from: result.from, to: result.to });
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err?.message || 'Could not save the conversion. Please try again.');
    }
  };

  //Function to clear the form
  const handleClear = () => {
    setForm(EMPTY_CONVERT_FORM);// Reset all form inputs (amount, from, and to) to their default values.
    setResult(null);// Remove the previous conversion result from the screen.

    setError('');// Clear any displayed error messages.
    resetSaveStatus();// Clear the save status along with the result it belonged to
  };

  /* Bootstrap variant for the save button, so its colour reports the
  outcome of the save rather than staying neutral once it is disabled. */
  const saveButtonVariant =
    saveStatus === 'saved' ? 'success' : saveStatus === 'error' ? 'danger' : 'light';

  return (
    <form id='currencyConverterForm' method='GET' onSubmit={handleConvert} >
      <div id='formHeadingBlock'>
        <h3 id='formHeading'>CURRENCY CONVERTER</h3>
      </div>
      <div id='currencyConverterInput'>
      {/* STACK 1 */}
        <Stack gap={3} id='converterStack1'>
        {/* AMOUNT */}
          <div className="p-2" id='convertAmountBlock'>
            <label className='converterLabel'>AMOUNT:</label>
            <div className='inputDiv'>
              <input
                className='input'
                id='converterAmount'
                type='number'
                placeholder='0'
                step='0.01'
                min='0.01'
                name='amount'
                value={form.amount}
                onChange={handleChange}
                //ARIA ATTRIBUTES:
                aria-label='Amount to convert'
                aria-required='true'
              />
              <small><Asterisk color='#C22419' fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
            </div>
          </div>
          {/* CONVERT FROM */}
          <div className="p-2" id='convertFromBlock'>
            <label className='converterLabel'>CONVERT FROM:</label>
            <div className='inputDiv'>
              <select
                className='input'
                required
                name='from'
                value={form.from}
                onChange={handleChange}
                // ARIA ATTRIBUTES:
                aria-label='ConvertFromCurrency'
              >
                <option value=''>SELECT</option>
                {/* MAP ALL AVAILABLE CURRENCIES WITH SELECT AS THE PLACEHOLDER */}
                {currencyOptions.map(({code, name})=> (
                  <option key={code} value={code}>{currencyOptionLabel(code, name)}</option>
                ))}
              </select>
              <small><Asterisk color='#C22419' fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
            </div>
          </div>
          {/* CONVERT TO: TARGET CURRENCY */}
          <div className="p-2" id='convertToBlock'>
            <label className='converterLabel'>CONVERT TO:</label>
            <div className='inputDiv'>
              <select
                className='input'
                required
                id='convertTo'
                name='to'
                value={form.to}
                onChange={handleChange}
              >
                <option value=''>SELECT</option>
                {/* MAP ALL AVAILABLE CURRENCIES WITH SELECT AS THE PLACEHOLDER */}
                {currencyOptions.map(({code, name})=> (
                  <option key={code} value={code}>{currencyOptionLabel(code, name)}</option>
                ))}
              </select>
              <small><Asterisk color='#C22419' fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
            </div>
          </div>
        </Stack>
      </div>
      {/* STACK 2 */}
      <Stack gap={3} id='converterStack2'>
        <div className="p-2" id='requiredInfos'>
          <span className='formTextSpan'>
            <small><Asterisk color='#C22419' fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
            <p className='reqText'>INDICATES REQUIRED INFORMATION</p>
          </span>
        </div>
        <div className="p-2" id='convertBtnBlock'>
          <Button
            variant='light'
            id='convertBtn'
            type='submit'
            disabled={loading}
            // ARIA ATTRIBUTES:
            role='button'
            aria-label={loading ? 'CONVERTING...' : 'CONVERT'}
            aria-disabled={loading}
          >
            {loading ? 'CONVERTING...' : 'CONVERT'}
          </Button>
        </div>
        <div className="p-2" id='clearConverterBlock'>
          <Button
            variant='danger'
            id='clearFormBtn'
            type='button'
            onClick={handleClear}
            disabled={loading}
            // ARIA ATTRIBUTES
          >
            <RotateCcw fontSize={16} fontWeight={700} aria-hidden='true' focusable='false'/>CLEAR
          </Button>
        </div>
        <div className="p-2" id='converterResultBlock' aria-live='polite'>
          {/* Only display the Result after form submission */}
          {result && (
            <>
              <p className='infoText'>
                {result.amount} {result.from} = {toConvertedAmount(result.result)} {result.to}
              </p>
              {/* The day Frankfurter published the rate, so the figure is dated */}
              {result.date && (
                <p className='infoText'>
                  1 {result.from} = {toQuotedRate(result.rate)} {result.to} (rate of {result.date})
                </p>
              )}
              {/* BUTTON TO SAVE CURRENCY CONVERTER CALCULATION.
              Only rendered once a conversion is on screen, and disabled while the
              request is running or after it has succeeded, so the same conversion
              cannot be written to the history twice. */}
              {saveConversion && (
                <>
                  <Button
                    id='saveConversionBtn'
                    /* Turns green once the conversion is safely in the user's
                    history, red when the save was rejected. */
                    variant={saveButtonVariant}
                    type='button'
                    onClick={handleSave}
                    disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                    // ARIA ATTRIBUTES:
                    aria-label='Save this conversion to your history'
                    aria-disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                  >
                    {saveStatus === 'saving'
                      ? 'SAVING...'
                      : saveStatus === 'saved'
                      ? 'SAVED TO HISTORY'
                      : 'SAVE CALCULATION'}
                  </Button>
                  {/* Only shown when the save itself failed; the conversion is unaffected */}
                  {saveStatus === 'error' && (
                    <p className='infoText' style={{ color: '#C22419' }} role='alert'>{saveError}</p>
                  )}
                </>
              )}
            </>
          )}
        </div>
        {/* ========ERROR MESSAGE==================== */}
        {error && (
          <p className='infoText' style={{ color: '#C22419' }} role='alert' aria-live='assertive'>{error}</p>
        )}
      </Stack>
    </form>
  )
}
