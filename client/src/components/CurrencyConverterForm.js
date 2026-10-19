import React from 'react'
import '../css/componentCss/FormSetup.css'
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { Asterisk, RotateCcw } from 'lucide-react';
export default function CurrencyConverterForm() {
  return (
    <form id='currencyConverterForm' method='GET' >
      <div id='formHeadingBlock'>
        <h3 id='formHeading'>CURRENCY CONVERTER</h3>
      </div>
      <div id='currencyConverterInput'>
        <Stack gap={3}>
      <div className="p-2">
        <label className='converterLabel'>AMOUNT:</label>
        <div className='inputDiv'>
          <input
          className='input'
          id='converterAmount'
            type='number'
            step='0.01'
                min='0.01'
            name='amount'
            // value={}
            // onChange={}
            //ARIA ATTRIBUTES
          />
          <small><Asterisk color='#C22419' fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
        </div>
      </div>
      <div className="p-2">
        <label className='converterLabel'>CONVERT FROM:</label>
        <div className='inputDiv'>
          <select>
            <option value=''>SELECT</option>
            {/* MAP ALL AVAILABLE CURRENCIES WITH SELECT AS THE PLACEHOLDER */}
          </select>
          <small><Asterisk color='#C22419' fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
        </div>
      </div>
      <div className="p-2">
        <label className='converterLabel'>CONVERT TO:</label>
        <div className='inputDiv'>
          <select>
            <option value=''>SELECT</option>
            {/* MAP ALL AVAILABLE CURRENCIES WITH SELECT AS THE PLACEHOLDER */}
          </select>
          <small><Asterisk color='#C22419' fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
        </div>
      </div>
    </Stack>

      </div>
<Stack gap={3}>
      <div className="p-2">
        <span className='formTextSpan'>
          <small><Asterisk color='#C22419' fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
          <p className='reqText'>INDICATES REQUIRED INFORMATION</p>
        </span>
      </div>
      <div className="p-2">
        <Button
        variant='light'
        id='submitConverter'
        type='submit'
        
        >
          CONVERT
        </Button>
      </div>
      <div className="p-2">
        <Button
          variant='danger'
          id='clearFormBtn'
          >
            <RotateCcw fontSize={16} fontWeight={700} aria-hidden='true' focusable='false'/>CLEAR
          </Button>
      </div>
    </Stack>

    </form>
  )
}
