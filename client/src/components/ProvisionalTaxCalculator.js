//ProvisionalTaxCalculator.js
import React, { useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/ProvisionalTaxCalc.css'
import '../css/componentCss/CalculatorSetup.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { AlertCircle } from 'lucide-react';
//ProvisionalTaxCalculator function component
/* ---------------------------------------------------------------------------
SARS provisional tax (IRP6) calculator. Posts to /provisional/calculate and
renders the working the way an IRP6 is laid out: the tax on the estimate for
the whole year, the portion this payment covers, and everything already
withheld or paid coming off it.

Provisional tax is worked out from the SAME brackets and rebates as income
tax, so the tax years come from GET /tax/config and are passed in as
`taxYears`, exactly as they are for TaxCalculatorForm.*/
export default function ProvisionalTaxCalculator() {
  //========STATE VARIABLES==============
  const [form, setForm] = useState()
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "saved" | "error"
  const [errors, setErrors] = useState({});


  //=============JSX RENDERING=============
  return (
    <div id='provTaxCalculatorDiv'>
      <form id='provisionalTaxCalculater'>
        <div id='calculatorHeadingBlock'>
          <h3 id='calculatorHeading'>PROVISIONAL TAX CALCULATOR</h3>

        </div>

      </form>
    </div>
  )
}
