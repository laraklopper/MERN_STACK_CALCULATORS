//IncomeTaxCalculator.js
import React, { useCallback, useEffect, useState } from 'react'
import '../css/componentCss/CalculatorSetup.css'
import '../css/componentCss/IncomeTaxCalculator.css'
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { AlertCircle, Asterisk, Calculator, RotateCcw } from 'lucide-react'
import { BLANK_TAX_FORM } from '../util/calculatorFunc'
import { formatCurrency, formatPercent } from '../util/currencyFunc';

export default function IncomeTaxCalculator({currentUser, taxYears}) {
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


  //Request to calculate taxCalculation
//POST /tax/calculate  
  const calculateTax = useCallback(async () => {
    try {
      
    } catch (error) {
      
    }
  },[])
  // Request function to save calculation
//POST /tax/save
  const saveTaxCalculation = useCallback(async () => {
    try {
      
    } catch (error) {
      
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
  // Function to submit tax calculator
  // call the calculateTax function
  const handleSubmit = () => {

  }

  // Function to saveCalculation
  // call the saveTaxCalculation request function
  const handleSave = () => {

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
        <label className='calculatorLabel' htmlFor=''>INCOME PERIOD:</label>
        <small><Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
      </div>
      <div className="p-2" id="taxCalcBlock2">
        <div className="button-div">
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
           <div className="p-2">
       {/* ANNUAL/MONTHLY INCOME */}
            <div className="inputDiv">
             <label className="calculatorLabel">
              {form.incomeType === "monthly" ? "Monthly income (R)" : "Annual income (R)"}:
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={form.incomeType === "monthly" ? "25000" : "300000"}
              className="input"
              value={form.income}
              required
              onChange={(e) => updateField("income", e.target.value)}
              // ARIA ATTRIBUTES:
              aria-required='true'
            />
            <small><Asterisk color="#C22419" fontWeight={700} size={14} aria-hidden='true' focusable='false' /></small>
            {errors.income && <p className="field-error">{errors.income}</p>}
            </div>
      </div>
      </div>
    </Stack>
        </div>
        {/* GROUP 2 */}
          <div id='taxCalculatorGroup2'>
          {/* INPUT STACK 2 */}
             <Stack gap={3} id='taxCalcInputStack2'>
       <div className="p-2">
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
              <small><Asterisk color="#C22419" fontWeight={700} size={14} aria-hidden='true' focusable='false' /></small>
            {errors.age && <p className="field-error">{errors.age}</p>}
          </div>
      </div>
      {/* TAX YEAR */}
      <div className="p-2">
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
      <div className="p-2">
         {/* MEDICAL AID DEPENDENTS */}
         <label className="calculatorLabel" htmlFor=''>Medical aid dependants:</label>
<div className="inputDiv">
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
            <span>
                            <p className="form-text">
              Saved with your calculation for reference. Medical scheme fees tax
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

