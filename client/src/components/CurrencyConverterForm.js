import React, { useState } from 'react'
import '../css/componentCss/CurrencyConverter.css'
import '../css/componentCss/FormSetup.css'
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { Asterisk, RotateCcw } from 'lucide-react';

export default function CurrencyConverterForm(
  {
    form,
    setForm,
    setError,
    result,
    setResult,
    EMPTY_CONVERT_FORM,
    currencyOptions = [],
    loading,
    saveConversion,
    submitConvert
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
  return (
    <form id='currencyConverterForm' method='GET' onSubmit={handleConvert} >
      <div id='formHeadingBlock'>
        <h3 id='formHeading'>CURRENCY CONVERTER</h3>
      </div>
      <div id='currencyConverterInput'>
        <Stack gap={3}>
      <div className="p-2" id='convertAmountBlock'>
        <label className='converterLabel'>AMOUNT:</label>
        <div className='inputDiv'>
          <input
          className='input'
          id='converterAmount'
            type='number'
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
      <div className="p-2" id='convertToBlock'>
        <label className='converterLabel'>CONVERT TO:</label>
        <div className='inputDiv'>
          <select className='input'>
            <option value=''>SELECT</option>
            {/* MAP ALL AVAILABLE CURRENCIES WITH SELECT AS THE PLACEHOLDER */}
          </select>
          <small><Asterisk color='#C22419' fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
        </div>
      </div>
    </Stack>
      </div>
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
        >
          CONVERT
        </Button>
      </div>
      <div className="p-2" id='clearConverterBlock'>
        <Button
          variant='danger'
          id='clearFormBtn'
          type='button'
          // onClick={}
          // ARIA ATTRIBUTES
          >
            <RotateCcw fontSize={16} fontWeight={700} aria-hidden='true' focusable='false'/>CLEAR
          </Button>
      </div>
    </Stack>

    </form>
  )
}
