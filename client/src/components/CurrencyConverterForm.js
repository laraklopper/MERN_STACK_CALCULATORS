import React from 'react'
import '../css/componentCss/FormSetup.css'
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';

export default function CurrencyConverterForm() {
  return (
    <form id='currencyConverterForm' method='GET' >
      <div id='formHeadingBlock'>
        <h3 id='formHeading'>CURRENCY CONVERTER</h3>
      </div>
      <div>
        <Stack gap={3}>
      <div className="p-2">First item</div>
      <div className="p-2">Second item</div>
      <div className="p-2">Third item</div>
    </Stack>

      </div>
<Stack gap={3}>
      <div className="p-2">First item</div>
      <div className="p-2">Second item</div>
      <div className="p-2">Third item</div>
    </Stack>

    </form>
  )
}
