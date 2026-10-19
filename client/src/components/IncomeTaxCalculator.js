//IncomeTaxCalculator.js
// IMPORT REQUIRED MODULES AND PACKAGES
import React, { useCallback, useEffect, useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/CalculatorSetup.css'
import '../css/componentCss/IncomeTaxCalculator.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
// IMPORT ICONS FROM LUCIDE-REACT
import { AlertCircle, Asterisk, Calculator, RotateCcw, TrendingUp } from 'lucide-react'
// IMPORT UTILITY FUNCTIONS
import { BLANK_TAX_FORM, formatPercent, toTaxPayload, validateTaxForm } from '../util/calculatorFunc'
import { formatCurrency } from '../util/currencyFunc';

/* Function to send a POST request to /tax/<path> with the logged in user's token.
Shared by calculateTax and saveTaxCalculation, which post the same body.
Returns the parsed response, or throws with the server's message. */
const postTax = async (path, payload) => {
  const token = localStorage.getItem('token')
  // Send a POST request to the /tax/<path> endpoint
  const response = await fetch(`http://localhost:3001/tax/${path}`, {
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

export default function IncomeTaxCalculator({currentUser, taxYears = []}) {
  const [form, setForm] = useState({
    ...BLANK_TAX_FORM,
    taxYear: taxYears[0] ?? "",
  });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null); // null | "calculating" | "error"
  const [statusMessage, setStatusMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "saved" | "error"

  useEffect(() => {
    if (!taxYears.length) return;
    setForm((prev) =>
      taxYears.includes(prev.taxYear) ? prev : { ...prev, taxYear: taxYears[0] }
    );
  },[taxYears])


  /* Request to calculate taxCalculation: sends a POST request to /tax/calculate.
  Returns the calculated result, or throws with the server's message. */
  const calculateTax = useCallback(async (payload) => {
    try {
      const data = await postTax('calculate', payload)
      return data.result
    } catch (error) {
      console.error('[ERROR: IncomeTaxCalculator.js, calculateTax]: Error calculating income tax:', error.message);//Log an error message in the console for debugging purposes
      throw error
    }
  },[])
  /* Request function to save calculation: sends a POST request to /tax/save.
  Returns the server's response, or throws with the server's message. */
  const saveTaxCalculation = useCallback(async (payload) => {
    try {
      return await postTax('save', payload)
    } catch (error) {
      console.error('[ERROR: IncomeTaxCalculator.js, saveTaxCalculation]: Error saving income tax calculation:', error.message);//Log an error message in the console for debugging purposes
      throw error
    }
  },[])

    const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setResult(null);
    setSaveStatus(null);
  };

  const resetForm = () => {
    setForm({ ...BLANK_TAX_FORM, taxYear: taxYears[0] ?? "" });
    setErrors({});
    setResult(null);
    setStatus(null);
    setSaveStatus(null);
  };
  /* Function to submit tax calculator: validates the form, then calls
  calculateTax which posts to /tax/calculate. */
  const handleSubmit = async (e) => {
    e.preventDefault()

    const formErrors = validateTaxForm(form)
    setErrors(formErrors)
    // Conditional rendering to stop the request when a field is unusable
    if (Object.keys(formErrors).length > 0) {
      setResult(null)
      return
    }

    setStatus("calculating")
    setStatusMessage("")
    setResult(null)
    setSaveStatus(null)
    try {
      const calculated = await calculateTax(toTaxPayload(form))
      setResult(calculated)
      setStatus(null)
    } catch (error) {
      setStatus("error")
      setStatusMessage(error.message || "Could not calculate tax. Try again.")
    }
  }

  /* Function to saveCalculation: posts the inputs of the result on screen to
  /tax/save. The server recalculates from them, so the saved record cannot
  differ from what was shown. */
  const handleSave = async () => {
    // Conditional rendering to make sure there is a calculation to save
    if (!result) return

    setSaveStatus("saving")
    try {
      await saveTaxCalculation({
        incomeType: result.incomeType,
        income: result.income,
        age: result.age,
        taxYear: result.taxYear,
        dependants: result.dependants,
      })
      setSaveStatus("saved")
    } catch (error) {
      setSaveStatus("error")
    }
  }
    /* Bootstrap variant for the save button, so its colour reports the outcome
  of the save rather than staying neutral once the button is disabled. */
  const saveButtonVariant =
    saveStatus === "saved" ? "success" : saveStatus === "error" ? "danger" : "light";

  //===========JSX RENDERING======================
  return (
    <div id='incomeTaxCalculator'>
    {status === "error" && (
        <div className="alert alert--error">
          <AlertCircle size={16} className="alert__icon" />
          {statusMessage}
        </div>
      )}
      <form id='taxCalculatorForm' method='POST' onSubmit={handleSubmit} aria-labelledby='calculatorHeading'>
        <div id='calculatorHeadingBlock'>
          <Stack gap={3} id='calculatorHeadingStack'>
      <div className="p-2" id='taxCalculatorHeadingBlock'>
        <h3 id="calculatorHeading">Income Tax Calculator</h3>
      </div>
      <div className="p-2" id='taxCalcTextBlock'>
        <p className="calculatorText">
          Calculate your SARS income tax liability based on your income, age,
          and the selected tax year.
        </p>
      </div>
    </Stack>
        </div>
        {/* =====INPUT=========== */}
        <div id='taxCalculatorInput'>
        {/* GROUP 1: */}
        <div id='taxCalculatorGroup1'>
        {/* INPUT STACK 1 */}
        <Stack gap={3} id='taxCalcInputStack1'>
        {/* INCOME PERIOD */}
      <div className="p-2" id="taxCalcBlock1">
      <span id='taxPeriodBtnSpan'>
        <label className='calculatorLabel' htmlFor=''>INCOME PERIOD:</label>
        <Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' />
      </span>
        <div id="taxPeriodBtnDiv">
            {["annual", "monthly"].map((t) => (
              <Button
                key={t}
                id="incomeStatedBtn"
                type="button"
                variant="light"
                onClick={() => updateField("incomeType", t)}
                className={`toggle-button${
                  form.incomeType === t ? " toggle-button--active" : ""
                }`}
                aria-pressed={form.incomeType === t}
              >
                {t}
              </Button>
            ))}
          </div>        
      </div>
        <div className="p-2" id="taxCalcBlock2">
       {/* ANNUAL/MONTHLY INCOME */}
        <span className='calcLabelSpan'>
                <label className="calculatorLabel">
              {form.incomeType === "monthly" ? "Monthly income (R)" : "Annual income (R)"}:
            </label>
            </span>
            <div className="calcTextInputDiv">
            {/* display the R in the input tag */}
            <p className='calculatorInpText'>R:</p>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={form.incomeType === "monthly" ? "25000" : "300000"}
              className="calculatorInput"
              value={form.income}
              required
              onChange={(e) => updateField("income", e.target.value)}
              // ARIA ATTRIBUTES:
              aria-required='true'
            />
            <Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' />
            {errors.income && <p className="field-error">{errors.income}</p>}
            </div>
      </div>
    </Stack>
        </div>
        {/* GROUP 2 */}
          <div id='taxCalculatorGroup2'>
          {/* INPUT STACK 2 */}
             <Stack gap={3} id='taxCalcInputStack2'>
       <div className="p-2" id='taxAgeBlock'>
      {/* AGE */}
      <label className="calculatorLabel" htmlFor="taxAgeInput">Age:</label>
        <div className="inputDiv">
            <input
              type="number"
              required
              min="16"
              max="120"
              step="1"
              placeholder="35"
              className="calculatorInput"
              value={form.age}
              onChange={(e) => updateField("age", e.target.value)}
              id="taxAgeInput"
              // ARIA ATTRIBUTES:
              aria-required='true'
            />
              <small><Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
            {errors.age && <p className="field-error">{errors.age}</p>}
          </div>
      </div>
      {/* TAX YEAR */}
      <div className="p-2" id='taxYearBlock'>
        <label className="calculatorLabel">Tax year:</label>
          <div className="inputDiv">
            <select
            className="calculatorInput"
            required
              value={form.taxYear}
              onChange={(e) => updateField("taxYear", e.target.value)}
              // ARIA ATTRIBUTES
              aria-required='true'
              // aria-label=''
            >
            {/* MAP THE TAX YEARS */}
              {taxYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <small><Asterisk color="#C22419" fontWeight={700} size={14} aria-hidden='true' focusable='false' /></small>
            {errors.taxYear && <p className="field-error">{errors.taxYear}</p>}
          </div>
      </div>
      <div className="p-2" id='taxMedicalAIDBlock'>
         {/* MEDICAL AID DEPENDENTS */}
         <label className="calculatorLabel" htmlFor=''>Medical aid dependants:</label>
<div className="calcInputDiv">
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0"
              className="calculatorInput"
              value={form.dependants}
              onChange={(e) => updateField("dependants", e.target.value)}
            />
            {errors.dependants && <p className="fieldError">{errors.dependants}</p>}
            {/* Recorded with the calculation, but no credit is applied yet -
            the tax year data holds no medical scheme fees credit figures. */}
            <span className='calculatorTextSpan'>
                            <p className="calcFormText" id='medicalAidText'>
              Saved with your calculation for reference. Medical scheme fees tax<br/>
              credits are not applied to the result.
            </p>
            </span>
          </div>
      </div>
    </Stack>
          </div>
        </div>
        {/* END OF INPUT */}
        {/* GROUP 3: FORM ACTIONS(BUTTONS) */}
        <div id='taxCalculatorGroup3'>
            <Stack gap={3}>
       <div className="p-2" id='required-calculafInfo'>
              <p className='infoText' aria-live='polite' aria-hidden='true'>
                  <small><Asterisk color="#C22419" fontWeight={700} size={16} aria-hidden='true' focusable='false' /> Indicates required information</small>
              </p>
      </div>
      <div className="p-2">
          <Button
            type="submit"
            id="calculateTaxBtn"
            disabled={status === "calculating"}
            variant="light"
          >
            <Calculator size={16} fontWeight={700} aria-hidden='true' focusable='false'/>
            {status === "calculating" ? "Calculating..." : "Calculate"}
          </Button>
      </div>
      <div className="p-2">
        <Button 
          variant="danger"
          type="button" onClick={resetForm} id="clearFormBtn">
            <RotateCcw size={16} /> Reset
          </Button>
      </div>
    </Stack>

        </div>
        {/* RESULTS */}
        

      </form>
          {/* --- Results --- */}
      {result && (
        <div className="results">
          <div className="results__header">
            <TrendingUp size={18} className="results__icon" />
            <h2 className="results__title">Result</h2>
          </div>

          <div className="results-summary">
            <div className="results-card">
              <p className="results-card__label">Gross tax</p>
              <p className="results-card__value">{formatCurrency(result.grossTax)}</p>
            </div>
            <div className="results-card">
              <p className="results-card__label">Rebate applied</p>
              <p className="results-card__value">{formatCurrency(result.rebate)}</p>
            </div>
            <div className="results-card results-card--highlight">
              <p className="results-card__label">Net tax payable</p>
              <p className="results-card__value">{formatCurrency(result.netTax)}</p>
            </div>
          </div>

          <div className="results-summary results-summary--rates">
            <div className="rate-pill">
              <span className="rate-pill__label">Effective rate</span>
              <span className="rate-pill__value">{formatPercent(result.effectiveRate)}</span>
            </div>
            <div className="rate-pill">
              <span className="rate-pill__label">Marginal rate</span>
              <span className="rate-pill__value">{formatPercent(result.marginalRate)}</span>
            </div>
          </div>

          {result.bracketBreakdown?.length > 0 && (
            <div className="table-wrapper">
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>Bracket (R)</th>
                    <th>Rate</th>
                    <th>Amount in bracket</th>
                    <th>Tax for bracket</th>
                  </tr>
                </thead>
                <tbody>
                  {result.bracketBreakdown.map((row, i) => (
                    <tr key={i}>
                      <td>
                        {formatCurrency(row.min)} – {row.max ? formatCurrency(row.max) : "+"}
                      </td>
                      <td>{formatPercent(row.rate * 100)}</td>
                      <td>{formatCurrency(row.amountInBracket)}</td>
                      <td className="breakdown-table__balance">
                        {formatCurrency(row.taxForBracket)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="disclaimer">
            This calculator is for estimation purposes only and does not
            constitute tax advice. Consult SARS or a registered tax
            practitioner for official calculations.
          </p>
          {/* RESULT */}

          {currentUser && (
            <div className="save-row">
              <Button
                type="button"
                /* Turns green once the calculation is safely in the user's
                history, red when the save was rejected. */
                variant={saveButtonVariant}
                id="saveCalculationBtn"
                onClick={handleSave}
                disabled={saveStatus === "saving" || saveStatus === "saved"}
                className="save-link"
              >
                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "saved"
                  ? "Saved to history"
                  : "Save to history"}
              </Button>
              {saveStatus === "error" && (
                <span className="save-error">Could not save. Try again.</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

