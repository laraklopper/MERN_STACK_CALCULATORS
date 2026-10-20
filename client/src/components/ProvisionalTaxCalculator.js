//ProvisionalTaxCalculator.js
import React, { useCallback, useEffect, useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/ProvisionalTaxCalc.css'
import '../css/componentCss/CalculatorSetup.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { AlertCircle, Asterisk, Calculator, RotateCcw } from 'lucide-react';
// IMPORT CUSTOM COMPONENTS
import ProvisionalTaxResults from './ProvisionalTaxResults';
import { BLANK_PROV_TAX_FORM, PROVISIONAL_PERIODS, provisionalPeriodConfig, toProvTaxPayload, validateProvTaxForm } from '../util/taxCalculatorFunc';

/* Function to send a POST request to /provisional/<path> with the logged in
user's token. Shared by calculateProvTax and saveCalculation, which post the
same body. Returns the parsed response, or throws with the server's message. */
const postProvTax = async (path, payload) => {
  const token = localStorage.getItem('token')
  // Send a POST request to the /provisional/<path> endpoint
  const response = await fetch(`http://localhost:3001/provisional/${path}`, {
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
  taxYears = [],
  currentUser,
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

  /* Request function to calculate provisional tax: sends a POST request to
  /provisional/calculate. Returns the calculated result, or throws with the
  server's message. */
  const calculateProvTax = useCallback(async (payload) => {
    try {
      const data = await postProvTax('calculate', payload)
      return data.result
    } catch (error) {
      console.error('[ERROR: ProvisionalTaxCalculator.js, calculateProvTax]: Error calculating provisional tax:', error.message);//Log an error message in the console for debugging purposes
      throw error
    }
  },[])

  /* Request function to save provisional tax calculation: sends a POST request
  to /provisional/save. Returns the server's response, or throws with the
  server's message. */
  const saveCalculation = useCallback(async (payload) => {
    try {
      return await postProvTax('save', payload)
    } catch (error) {
      console.error('[ERROR: ProvisionalTaxCalculator.js, saveCalculation]: Error saving provisional tax calculation:', error.message);//Log an error message in the console for debugging purposes
      throw error
    }
  },[])
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

  /* Function to submit provisional tax calculator form: validates the form,
  then calls calculateProvTax which posts to /provisional/calculate. */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Conditional rendering to stop the request when a field is unusable
    if (!validate()) {
      setResult(null)
      return
    }

    setStatus("calculating")
    setStatusMessage("")
    setResult(null)
    setSaveStatus(null)
    try {
      const calculated = await calculateProvTax(toProvTaxPayload(form))
      setResult(calculated)
      setStatus(null)
    } catch (error) {
      setStatus("error")
      setStatusMessage(error.message || "Could not calculate provisional tax. Try again.")
    }
  }

  /* Function to save the calculation: posts the inputs of the result on screen
  to /provisional/save. The server recalculates from them, so the saved record
  cannot differ from what was shown. */
  const handleSave = async () => {
    // Conditional rendering to make sure there is a calculation to save
    if (!result) return

    setSaveStatus("saving")
    try {
      await saveCalculation({
        period: result.period,
        taxYear: result.taxYear,
        estimatedTaxableIncome: result.estimatedTaxableIncome,
        age: result.age,
        employeesTax: result.employeesTax,
        foreignTaxCredits: result.foreignTaxCredits,
        medicalCredits: result.medicalCredits,
        priorPayments: result.priorPayments,
        basicAmount: result.basicAmount,
      })
      setSaveStatus("saved")
    } catch (error) {
      setSaveStatus("error")
    }
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
          {/* INPUT STACK 1: */}
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
              <div  id="provTaxPeriodBlock2">
                <p className="provCalcText" aria-live="polite">
                  <strong>{period.heading}:</strong> <br/> {period.portionLabel}. <br/> {period.dueLabel}.
                </p>
              </div>
            <div className="p-2">
              {errors.period && <p className="field-error">{errors.period}</p>}
            </div>
          </Stack>
          </div>
          {/* GROUP 2: THE ESTIMATE + AGE + TAX YEAR*/}
          <div id='provTaxGroup2'> 
          {/* INPUT STACK 2: ESTIMATED TAXABLE 
          INCOME FOR THE FULL YEAR */}
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
      <div className="p-2" id='taxEstimateBlock2'>
        <p className='provCalcText'>
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
    {/* INPUT STACK 3: AGE */}
    <Stack gap={3} id='provTaxInputStack3'>
      <div className="p-2" id='provTaxAgeBlock1'>
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
      <div className="p-2" id='provTaxAgeBlock2'>
        {/* ERROR */}
        {errors.age && <p className="field-error">{errors.age}</p>}
      </div>
    </Stack>
    {/*INPUT STACK 4: TAX YEAR */}
    <Stack gap={3} id='provTaxInputStack4'>
      <div className="p-2" id='provTaxYearBlock1'>
        {/* LABEL & INPUT */}
        <span className='calcLabelSpan'>
          <label className='calculatorLabel' htmlFor='provTaxYear'>TAX YEAR:</label>
        </span>
        <div className='calculatorInputDiv'>
              <select
                    id="provTaxYear"
                    className="input"
                    required
                    name='taxYear'
                    value={form.taxYear}
                    onChange={(e) => updateField("taxYear", e.target.value)}
                    // ARIA ATTRIBUTES:
                    aria-label='Provisional-Tax Year input'
                  >
                  {/* MAP ALL TAX YEARS WITH SELCT YEAR AS THE PLACEHOLDER*/}
                  <option value={''}>SELECT YEAR</option>
                    {taxYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
              <small><Asterisk color="#C22419" fontWeight={700} size={14} aria-hidden='true' focusable='false' /></small>
        </div>
      </div>
      <div className="p-2" id='provTaxYearBlock2'>
         {errors.taxYear && <p className="field-error">{errors.taxYear}</p>}
      </div>
    </Stack>
          </div>
          {/* GROUP 3: WHAT COMES OFF THE PAYMENT  */}
          <div id='provTaxGroup3'>
          {/* INPUT STACK 5 */}
                <span className='calcLabelSpan'>
<label className="calculatorLabel" id="provlabel">
                  Already withheld or paid:
                </label>
      </span>
      {/*INPUT STACK 5: EMPLOYEES' TAX (PAYE) */}
          <Stack gap={3} id='provTaxInputStack5'>   
      <div className="p-2" id="provTaxPayeBlock">
                    <span className='calculatorLabelSpan'>
                      <label className="calculatorLabel" id='provEmpLabel' htmlFor="provEmployeesTax">
                    Employees’ tax (PAYE) for <br/>this period (R):
                  </label>
                    </span>
                    <div className='calculatorInputDiv'>
                      <input
                    id="provEmployeesTax"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="calculatorInput"
                    value={form.employeesTax}
                    onChange={(e) => updateField("employeesTax", e.target.value)}
                  />
                    </div>
              </div>
      <div className="p-2" id='provForeignTaxCreditsBlock2'>
        {/* ERROR */}
      </div>
    </Stack>
    {/* INPUTSTACK 6: EMPLOYEES' TAX (PAYE) */}
    <Stack gap={3} id='provTaxInputStack6'>
      <div className="p-2" id='provForeignTaxCreditsBlock1'>
           <span className='calculatorLabelSpan'>
                      <label className="calculatorLabel" htmlFor="provForeignTaxCredits">
                    Foreign tax credits :
                  </label>
                    </span>
                      <div className='calcTextInputDiv'>
                      <p className='calculatorInpText'>R:</p>
                     <input
                    id="provForeignTaxCredits"
                    className="calculatorInput"
                    type='number'
                    min="0"
                    step={'0.01'}
                    name='foreignTaxCredits'
                    value={form.foreignTaxCredits}
                    onChange={(e) => updateField("foreignTaxCredits", e.target.value)}
                    // ARIA ATTRIBUTES:
                    aria-label='Provisional Tax Foreign Credits Input'
                    aria-required='false'
                  />
                  </div>
      </div>
      <div className="p-2" id='provForeignTaxCreditsBlock1'>
      {/* ERROR */}
        {errors.foreignTaxCredits && <p className="field-error">{errors.foreignTaxCredits}</p>}
      </div>
    </Stack>
    {/* INPUT STACK 7: MEDICAL SCHEME FEES TAX CREDITS  */}
    <Stack gap={3} id='provTaxInputStack7'>
      <div className="p-2" id='provMedFeesTaxCredits1'>
            <span className='calcLabelSpan'>
              <label className="calculatorLabel" htmlFor="provMedicalCredits">
                    Medical scheme fees tax credits:
                  </label>
            </span>
            <div className='calcTextInputDiv'>
            <p className='calculatorInpText'>R:</p>
            <input
             id="provMedicalCredits"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="input"
                    value={form.medicalCredits}
                    onChange={(e) => updateField("medicalCredits", e.target.value)}
                    // ARIA ATTRIBUTES:
                    // aria-label=''
                    aria-required='false'
            />
            </div>
      </div>
      <div className="p-2" id='provMedFeesTaxCredits2'>
        {/* The credit is an input, not something the calculator knows */}
                <p className="provCalcText">
                  Enter the credits for the full year as published <br/>by SARS
                  (a monthly amount per member and per dependant). They are deducted as 
                  entered, then the portion for this payment isapplied. 
                </p>
      </div>
      <div className="p-2" id='provMedFeesTaxCredits3'>
      {/* ERROR */}
         {errors.medicalCredits && <p className="field-error">{errors.medicalCredits}</p>}
      </div>
    </Stack>
    {/* INPUT STACK 8: PROVISIONAL TAX ALREADY PAID +
    BASIV AMOUNT */}
    <Stack gap={3} id='provTaxInputStack8'>
    {/* PROVISIONAL TAX ALREADY PAID - only where there can be any */}
     {period.acceptsPriorPayments && (
       <div className="p-2" id='priorPaymentBlock'>
        <label className="calculatorLabel" htmlFor="provPriorPayments">
                      Provisional tax already paid for this year (R):
                    </label>
       <div className='calcTextInputDiv'>
            <p className='calculatorInpText'>R:</p>
                    <input
                      id="provPriorPayments"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      className="input"
                      value={form.priorPayments}
                      onChange={(e) => updateField("priorPayments", e.target.value)}
                    />
                    {errors.priorPayments && <p className="field-error">{errors.priorPayments}</p>}
                  </div>
                  </div>
    )}
      {/* BASIC AMOUNT - only the estimated periods are judged against it */}
              {form.period !== 'third' && (
                <div className="p-2" id='basicAmountBlock'>
                <span className='calcLabelSpan'>
                  <label className="calculatorLabel" htmlFor="provBasicAmount">
                      Basic amount (last assessed taxable income) (R):
                    </label>
                </span>
                  <div className='calcTextInputDiv'>
                    <p className='calculatorInpText'>R:</p>
                    <input
                      id="provBasicAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                      className="input"
                      value={form.basicAmount}
                      onChange={(e) => updateField("basicAmount", e.target.value)}
                    />
                    {errors.basicAmount && <p className="field-error">{errors.basicAmount}</p>}
                  </div>
                </div>
              )}
              {form.period !== 'third' && (
                <div className="p-2">
                  <p className="provCalcText">
                    Optional. Supply it and the estimate is checked against it,
                    because an estimate below the basic amount may be increased
                    by SARS.
                  </p>
                </div>
              )}
    </Stack>
          </div>
        </div>
        <div className="form-actions">
          <Stack gap={2} className="col-md-5 mx-auto" id="prov-tax-btn-stack">
            <Button
              type="submit"
              id="calculateProvTaxBtn"
              disabled={status === "calculating"}
              variant="light"
              // ARIA ATTRIBUTES:
              role='button'
              aria-label={status === "calculating" ? "Calculating..." : "Calculate"}
              aria-disabled={status === "calculating"}
            >
              <Calculator size={16} aria-hidden='true' focusable='false' />
              {status === "calculating" ? "Calculating..." : "Calculate"}
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={resetForm}
              id="clearFormBtn"
            >
              <RotateCcw size={16} aria-hidden='true' focusable='false'/> Reset
            </Button>
          </Stack>
        </div>
      </form>
      {/* --- Results: rendered by ProvisionalTaxResults.js --- */}
      {result && (
        <ProvisionalTaxResults
          result={result}
          heading={period.heading}
          currentUser={currentUser}
          saveStatus={saveStatus}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
