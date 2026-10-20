//ProvisionalTaxCalculator.js
import React, { useCallback, useEffect, useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/ProvisionalTaxCalc.css'
import '../css/componentCss/CalculatorSetup.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { AlertCircle, Asterisk } from 'lucide-react';
import { BLANK_PROV_TAX_FORM, PROVISIONAL_PERIODS, provisionalPeriodConfig, validateProvTaxForm } from '../util/taxCalculatorFunc';
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
  taxYears,
  setError
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

   const calculateProvTax = useCallback(async () => {
    try {
     const token = localStorage.getItem('token')
     const response = await fetch(`http://localhost:3001/provisional/calculate`,{
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body:JSON.stringify({// Send the new payload in the request body as JSON
        form//payload
      })
     })
     const data = await response.json.catch(() => ({}));

     if (!response.ok) {
      console.error(`Could not calculate provisional tax. Please try again.`, data.message );//Log an error message in the console for debugging purposes
      throw new Error('Could not calculate provisional tax. Please try again.', data.message );
     }
    } catch (error) {
      setError('An error occurred . Please try again.');
      console.error('[ERROR: Login.js]: Login error:', error);
    }
  },[setError, form])

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

 
  // Function to submit provisional tax calculator form
  // Call the Calc
  const handleSubmit = (e) => {
    e.preventDefault()
    calculateProvTax()
  }
  //=============JSX RENDERING=============
  return (
    <div id='provTaxCalculatorDiv'>
      {status === "error" && (
        <div className="alert alert--error" role="alert">
          <AlertCircle size={16} className="alert__icon" />
          {statusMessage}
        </div>
      )}
      <form id='provisionalTaxCalculater' onSubmit={handleSubmit} method='POST' aria-labelledby='calculatorHeading' aria-describedby='provTaxCalcDescrip'>
        <div id='calculatorHeadingBlock'>
        {/* HEADING STACK */}
        <Stack gap={3} id='calcHeadStack'>
      <div className="p-2" id='calcHeadingBlock1'>
        <h3 id='calculatorHeading'>PROVISIONAL TAX CALCULATOR</h3>
      </div>
      <div className="p-2" id='calcHeadBlock2'>
        <p className="calculatorText" id='provTaxCalcDescrip'>
                Work out what is payable on an IRP6 from your estimated taxable
                income for the whole year of assessment. Provisional tax is not a
                separate tax: it is the same SARS income tax, paid in advance.
              </p>
      </div>
    </Stack>
        </div>
        {/* ------CALCULATOR INPUT------- */}
        <div id='provTaxCalcInput'>
        {/* GROUP 1 */}
          <div id='provTaxGroup1'>
          <Stack gap={3} id='provTaxInputStack1'>
            <div className="p-2" id='provTaxPeriodBlock1'>
              <span className='calculatorTextSpan'>
              <label className='calculatorLabel'>WHICH PAYMENT:</label>
              <small><Asterisk color="#C22419" fontWeight={700} size={14} aria-hidden='true' focusable='false' /></small>
              </span>
              <div id='buttonDiv'>
              {PROVISIONAL_PERIODS.map((p) => (
                <Button
                      key={p.value}
                      type="button"
                      variant="light"
                      onClick={() => updateField("period", p.value)}
                      /* Styled by class rather than by id: there are three of
                      these buttons, and an id can only belong to one element */
                      className={`prov-tax-period-btn toggle-button${
                        form.period === p.value ? " toggle-button--active" : ""
                      }`}
                      id='provPeriodBtn'
                      aria-pressed={form.period === p.value}
                    >
                      {p.label}
                </Button>
              ))}
              </div>
            </div>
            {/* What the selected payment covers and when it falls due */}
              <div className="p-2" id="provTaxPeriodBlock2">
                <p className="calculatorText" aria-live="polite">
                  <strong>{period.heading}:</strong> {period.portionLabel}. {period.dueLabel}.
                </p>
              </div>
            <div className="p-2">
              {errors.period && <p className="field-error">{errors.period}</p>}
            </div>
          </Stack>

          </div>
          {/* GROUP 2: THE ESTIMATE + AGE */}

          <div id='provTaxGroup2'> 
          {/* ESTIMATED TAXABLE INCOME FOR THE FULL YEAR */}
              <Stack gap={3} id='provTaxInputStack2'>
              
      <div className="p-2" id='taxEstimateBlock1'>
        <span className='calcLabelSpan'>
          <label className="calculatorLabel" htmlFor="provEstimatedIncome">
                    Estimated taxable income for the year:
                  </label>
        </span>
        <div className='calcTextInputDiv'>
        <p className='calculatorInpText'>R:</p>
              <input
               id="provEstimatedIncome"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="480000"
                    className="input"
                    value={form.estimatedIncome}
                    required
                    onChange={(e) => updateField("estimatedIncome", e.target.value)}
                    // ARIA ATTRIBUTES:
                    // aria-label=''
                    aria-required='true'
              />
               <small><Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>

        </div>
      </div>
      <div className="p-2">
        <p className="form-text">
                  Always the estimate for the FULL year of assessment. The
                  brackets are annual and progressive, so the portion for this
                  payment is taken off the tax, not off the income.
                </p>
      </div>
      <div className="p-2">
        {/* ERROR MESSAGE */}
        {errors.estimatedIncome && <p className="field-error">{errors.estimatedIncome}</p>}
      </div>
    </Stack>
    {/* AGE */}
    <Stack gap={3} id='provTaxInputStack3'>
      <div className="p-2">
        <span className='calcLabelSapn'>
          <label className='calculatorLabel' htmlFor="provTaxAgeInput">AGE:</label>
        </span>
        <div className='calculatorInputDiv'>
          <input
                    id="provTaxAgeInput"
                    type="number"
                    required
                    min="16"
                    max="120"
                    step="1"
                    placeholder="35"
                    className="input"
                    value={form.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    aria-required='true'
                  />
                  <small><Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
        </div>
      </div>
      <div className="p-2">Second item</div>
      <div className="p-2">Third item</div>
    </Stack>

          </div>

        </div>

      </form>
    </div>
  )
}
