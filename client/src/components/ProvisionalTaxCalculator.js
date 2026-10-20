//ProvisionalTaxCalculator.js
import React, { useCallback, useEffect, useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/ProvisionalTaxCalc.css'
import '../css/componentCss/CalculatorSetup.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { AlertCircle } from 'lucide-react';
import { BLANK_PROV_TAX_FORM, provisionalPeriodConfig, validateProvTaxForm } from '../util/taxCalculatorFunc';
//ProvisionalTaxCalculator function component
/* ---------------------------------------------------------------------------
SARS provisional tax (IRP6) calculator. Posts to /provisional/calculate and
renders the working the way an IRP6 is laid out: the tax on the estimate for
the whole year, the portion this payment covers, and everything already
withheld or paid coming off it.

Provisional tax is worked out from the SAME brackets and rebates as income
tax, so the tax years come from GET /tax/config and are passed in as
`taxYears`, exactly as they are for TaxCalculatorForm.*/
export default function ProvisionalTaxCalculator({
  taxYears
}) {
  //========STATE VARIABLES==============
  const [form, setForm] = useState({
    ...BLANK_PROV_TAX_FORM,
    taxYear: taxYears[0] ?? "",
  })
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "saved" | "error"
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null); // null | "calculating" | "error"
  const [statusMessage, setStatusMessage] = useState("");

  // Which of the three payments is being worked out, and how it is described
  const period = provisionalPeriodConfig(form.period)

  useEffect(() => {
    if (!taxYears.length) return;
    setForm((prev) =>
      taxYears.includes(prev.taxYear) ? prev : { ...prev, taxYear: taxYears[0] }
    );
  }, [taxYears]);

/* Any edit clears the result and the save status, so the figures on screen
  always belong to the inputs above them. */
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setResult(null);
    setSaveStatus(null);
  };

  //Functio to reset calculator form
   const resetForm = () => {
    setForm({ ...BLANK_PROV_TAX_FORM, taxYear: taxYears[0] ?? "" });
    setErrors({});
    setResult(null);
    setStatus(null);
    setSaveStatus(null);
  };
/* Function to check the inputs and show any field errors. 
  Returns true when the form is good to submit. */
  const validate =() => {
    const errs = validateProvTaxForm(form)
    setErrors(errs)
    return Object.keys(errs).length === 0;
  }

  const calculateProvTax = useCallback(async () => {
    try {
     const token = localStorage.getItem('token')
     const response 
    } catch (error) {
      
    }
  },[])

  // Function to submit provisional tax calculator form
  const handleSubmit = (e) => {
    e.preventDefault()
    setSaveStatus(null)

    if (!validate()) {
      setStatus("error")
      setStatusMessage("Please fix the highlighted fields.");
      return;
    }

    // if(!onCalculate){
    //   setStatus("")
    //   setStatusMessage("No calculation handler was provided to this form.");
    //   return;
    // }
  }
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
