// InterestCalculator.js
import React, { useCallback, useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/CalculatorSetup.css'
import '../css/componentCss/InterestCalculator.css'
import '../css/componentCss/FormSetup.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
//IMPORT ICONS FROM LUCIDE-REACT
import {  AlertCircle, Asterisk, Calculator, RotateCcw, TrendingUp } from "lucide-react";
// IMPORT UTILITY FUNCTIONS
import { BLANK_INTEREST_FORM, PERIOD_UNITS, periodConfig, COMPOUND_FREQUENCIES, validateInterestForm } from '../util/calculatorFunc';
import { formatCurrency } from '../util/currencyFunc';


// Simple & compound interest calculator, with optional recurring monthly
// contributions. Posts to /interest/calculate and renders the result
// plus a period-by-period breakdown table.
//
// The TIME PERIOD toggle lets the user work in either ANNUAL periods (time
// entered in years, one breakdown row per year) or MONTHLY periods (time
// entered in months, one breakdown row per month). The interest rate is
// always entered as an annual nominal rate so both options can be compared
// against the same quoted rate.
export default function InterestCalculator({currentUser, calculateInterest, saveInterest}) {
  const [form, setForm] = useState(BLANK_INTEREST_FORM);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null); // null | "calculating" | "error"
  const [statusMessage, setStatusMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "saved" | "error"
  const [saveMessage, setSaveMessage] = useState("");

  // Config (label, noun, max) for the time period unit the user selected
  const period = periodConfig(form.periodUnit);

  /* The logged in user's username, read from the user record rather than typed, so
  the FULL NAME fields below are filled in and read only. */
  const username = currentUser?.username ?? ''

  /* Bootstrap variant for the save button, so its colour reports the outcome
  of the save rather than staying neutral once the button is disabled. */
  const saveButtonVariant =
    saveStatus === "saved" ? "success" : saveStatus === "error" ? "danger" : "light";

  /* Heading for the breakdown table's first column. Driven by the result, not
  the form, so the table always describes the figures currently on screen. */
  const breakdownHeading = result?.periodUnit === "months" ? "Month" : "Year";
  // =============EVENT LISTENERS=============
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the field's error as soon as the user starts correcting it
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setResult(null);
    setSaveStatus(null);
    setSaveMessage("");
  };
  /* Switching between annual and monthly changes what the time period means,
  so the entered value is cleared rather than reinterpreted - 10 years is not
  the same investment as 10 months. */
  const updatePeriodUnit = (unit) => {
    if (unit === form.periodUnit) return;
    setForm((prev) => ({ ...prev, periodUnit: unit, time: "" }));
    setErrors((prev) => ({ ...prev, time: undefined }));
    setResult(null);
    setSaveStatus(null);
    setSaveMessage("");
  };

  //Function to resetForm
  const resetForm = () => {
    setForm(BLANK_INTEREST_FORM);
    setErrors({});
    setResult(null);
    setStatus(null);
    setStatusMessage("");
    setSaveStatus(null);
    setSaveMessage("");

  };

  //=======REQUEST FUNCTION HANDLERS===========
  /* Function to submit calculatorForm: validates the fields, then calls
  calculateInterest (Calculators.js) which posts to /interest/calculate. */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    const formErrors = validateInterestForm(form);
    setErrors(formErrors);
    // Conditional rendering to stop the request when a field is invalid
    if (Object.keys(formErrors).length > 0) return;

    setStatus("calculating");
    setStatusMessage("");
    setResult(null);
    setSaveStatus(null);
    setSaveMessage("");
    try {
      const calculated = await calculateInterest(form);
      setResult(calculated);
      setStatus(null);
    } catch (error) {
      setStatus("error");
      setStatusMessage(error.message || "Could not calculate interest. Try again.");
    }
  },[form, calculateInterest])

  /* Function to handle save calculation button: calls saveInterest
  (Calculators.js) which posts the same figures to /interest/save. The server
  recalculates them, so the saved record cannot differ from what was shown. */
  const handleSave = useCallback(async (e) => {
    e.preventDefault()

    setSaveStatus("saving");
    setSaveMessage("");
    try {
      const data = await saveInterest(form);
      setSaveStatus("saved");
      setSaveMessage(data?.message || "Calculation saved to your history");
    } catch (error) {
      setSaveStatus("error");
      setSaveMessage(error.message);
    }
  },[form, saveInterest])


  //=============================
  return (
    <div>
      <form id='interestCalculator' onSubmit={handleSubmit}>
        <div id='intCalculatorHeadBlock'>
          <h3 id='interestCalculatorHeading'>INTEREST CALCULATOR</h3>
          <span className='formTextSpan'>
            <p className="formText">
              Calculate how much interest you'll earn or owe over time, using
              simple or compound interest.
            </p>
          </span>
        </div>
        {status === "error" && (
          <div className="alert alert--error">
            <AlertCircle size={16} color='#C22419' className="alert__icon" />
            {statusMessage}
          </div>
        )}
        {/* INPUT */}
        <div id='interestCalculatorDetails'>
          {/* =====GROUP 1============ */}
          <div id='interestCalculatorGroup1'>
            {/* STACK 1 */}
            <Stack gap={3} id='interestFormStack1'>
              <div className="p-2" id='interestTypeSelectBlock'>
                <span className='calculatorLabelSpan'>
                  <label className="calculatorLabel">Interest type:</label>
                  <small><Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
                </span>
                {/* Interest Type Buttons */}
                <div id='interestTypeBtnBlock'>
                  {["simple", "compound"].map((t) => (
                    <Button
                      variant="light"
                      key={t}
                      type="button"
                      onClick={() => updateField("type", t)}
                      id='interestTypeSelectBtn'
                      className={`toggle-button${
                        form.type === t ? " toggle-button--active" : ""
                      }`}
                      // ARIA ATTRIBUTES:
                      aria-pressed={form.type === t}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="p-2" id='interestTypeInfo'>
                <span id='interestDescriptionSpan' aria-describedby='interestTypeInfoList'>
                  <p className='visually-hidden' id='interestTypeInfoList'>Difference Between simple and compound interest</p>
                  <p className='interestTypeItem'>Simple interest is worked out on the principal, or original, amount of a loan.</p>
                  <p className='interestTypeItem'>Compound interest is calculated on the principal (original) amount and also on the added interest of previous periods.</p>
                </span>
              </div>
            </Stack>
          </div>
          {/* GROUP 2: Principal Tax Amount, annual interest rate time period,  */}
          <div id='interestCalculatorGroup2'>
            {/* STACK 2 */}
            <Stack gap={3} id='interestFormStack2'>
              <div className="p-2" id='principalAmountBlock'>
                {/* PRINCIPAL TAX AMOUNT */}
                <label className='calculatorLabel' htmlFor='principalTaxAmount'>Principal amount: </label>
                <div id="principalAmountInputDiv">
                  <p className='calculatorInpText'>(R)</p>
                  <input
                    type="number"
                    id='principalTaxAmount'
                    min="0"
                    required
                    step="0.01"
                    placeholder="10000"
                    className='input'
                    value={form.principal}
                    onChange={(e) => updateField("principal", e.target.value)}
                  />
                  <small><Asterisk color="#C22419" fontWeight={700} size={14} aria-hidden='true' focusable='false' /></small>
                  {errors.principal && <p className="field-error">{errors.principal}</p>}
                </div>
              </div>
              {/* TIME PERIOD TOGGLE: calculate over annual or monthly periods */}
              <div className="p-2" id='interestTimeBlock'>
                <label className='calculatorLabel' htmlFor='interestPeriodSelectBtn'>TIME PERIOD:</label>
                <div id='periodBtnBlock'>
                  {PERIOD_UNITS.map((p) => (
                    <Button
                      variant='light'
                      key={p.value}
                      type='button'
                      onClick={() => updatePeriodUnit(p.value)}
                      id='interestPeriodSelectBtn'
                      className={`toggle-button${
                        form.periodUnit === p.value ? " toggle-button--active" : ""
                      }`}
                      // ARIA ATTRIBUTES:
                      aria-pressed={form.periodUnit === p.value}
                    >
                      {p.label}
                    </Button>
                  ))}
                  <small><Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
                </div>
                <p className='formText'>
                  {form.periodUnit === "months"
                    ? "Monthly: enter the time period in months and get a month-by-month breakdown."
                    : "Annual: enter the time period in years and get a year-by-year breakdown."}
                </p>
              </div>
              {/* ANNUAL INTEREST RATE */}
              <div className="p-2" id='annualInterestBlock'>
                <label className="calculatorLabel" htmlFor='annualInterest'>Annual interest rate (%)</label>
                <div className="inputDiv">
                  <input
                    type="number"
                    id='annualInterest'
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="7.5"
                    className='input'
                    value={form.rate}
                    onChange={(e) => updateField("rate", e.target.value)}
                    // ARIA ATTRIBUTES
                  />
                  <small><Asterisk color="#C22419" fontWeight={700} size={14} aria-hidden='true' focusable='false' /></small>
                  {errors.rate && <p className="field-error">{errors.rate}</p>}
                </div>
                <p className='formText'>
                  Always enter the yearly quoted rate - it is converted to the period
                  you selected above.
                </p>
              </div>
              {/* TIME PERIOD (YEARS OR MONTHS, PER THE TOGGLE ABOVE) */}
              <div className="p-2" id='timePeriodBlock'>
                <label className="calculatorLabel" htmlFor='interestTimePeriod'>Time period ({period.noun})</label>
                <div className='inputDiv'>
                  <input
                    type="number"
                    id='interestTimePeriod'
                    required
                    min="1"
                    max={period.max}
                    step="1"
                    placeholder={period.placeholder}
                    className='input'
                    value={form.time}
                    onChange={(e) => updateField("time", e.target.value)}
                    // ARIA ATTRIBUTES:
                    aria-label={`Time period in ${period.noun}`}
                    aria-required='true'
                  />
                  <small><Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
                  {errors.time && <p className="field-error">{errors.time}</p>}
                </div>
              </div>
            </Stack>
          </div>
          {/* GROUP 3: Compounding Frequency + Optional recurring monthly contribution */}
          <div id='interestCalculatorGroup3'>
            {/* STACK 3 */}
            <Stack gap={3} id='interestFormStack3'>
              <div className="p-2" id='compoundingFreqBlock'>
                {/* COMPOUNDING FREQUENCY */}
                <label className="calculatorLabel" htmlFor='compoundingFrequency'>Compounding frequency:</label>
                <div className='inputDiv'>
                  {form.type === "compound" && (
                    <div className="inputDiv">
                      <select
                        id='compoundingFrequency'
                        className='input'
                        value={form.compoundingFrequency}
                        onChange={(e) => updateField("compoundingFrequency", e.target.value)}
                      >
                        {COMPOUND_FREQUENCIES.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              {/* OPTIONAL CONTRIBUTIONS */}
              <div className="p-2" id='optControbutionBlock'>
              <label className="calculatorLabel" htmlFor='monthlyContribution'>Optional recurring monthly contribution </label>
                <div className="inputDiv">
                  <p className='calculatorInpText'>(R)</p>
                  <input
                    type="number"
                    id='monthlyContribution'
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className='input'
                    value={form.monthlyContribution}
                    onChange={(e) => updateField("monthlyContribution", e.target.value)}
                  />
                  {errors.monthlyContribution && (
                    <p className="field-error">{errors.monthlyContribution}</p>
                  )}
                </div>
              </div>
              {/* HIDDEN USERNAME */}
              <div className="p-2" id='usernameInputBlock' hidden>
                <label className='calculatorLabel' htmlFor='interestUsername'>USERNAME:</label>
                <input
                  type='text'
                  readOnly
                  id='interestUsername'
                  name='username'
                  value={username}
                  // ARIA ATTRIBUTES:
                  aria-label='currentuser username'
                  aria-readonly='true'
                  aria-required='true'
                />
                <small><Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
              </div>
            </Stack>
          </div>
          <div className="form-actions">
            <Stack gap={2} className="col-md-5 mx-auto" id='interestform-btn-stack'>
              <div className="p-2" id='requiredInfo'>
                <p className='infoText' aria-live='polite' aria-hidden='true'>
                  <small><Asterisk color="#C22419" fontWeight={700} size={16} aria-hidden='true' focusable='false' /> Indicates required information</small>
                </p>
              </div>
              <Button
                variant='light'
                type="submit"
                disabled={status === "calculating"}
                id='calculateInterestBtn'
                // ARIA ATTRIBUTES
                role='button'
                aria-label={status === "calculating" ? "Calculating..." : "Calculate"}
                aria-disabled={status === "calculating"}
              >
                <Calculator fontWeight={700} size={16} aria-hidden='true' focusable='false' />
                {status === "calculating" ? "Calculating..." : "Calculate"}
              </Button>
              <Button variant='danger' type="button" onClick={resetForm} id='clearFormBtn'>
                <RotateCcw size={16} aria-hidden='true' focusable='false'/> Reset
              </Button>
            </Stack>
          </div>
        </div>
      </form>
      {/* --- Results --- */}
      {result && (
        <div className="results">
          <div className="result-header">
            <TrendingUp size={32} className="results__icon" aria-hidden='true' focusable='false' />
            <h4 className="results__title">Result</h4>
          </div>
          <div className="results-summary">
            <Stack gap={1} id='result-summary-stack'>
              <div className="p-2" id='intResultsBlock1'>
                <p className="resultsLabel">Total interest earned:</p>
                <p className="resultsValue">{formatCurrency(result.totalInterest)}</p>
              </div>
              {/* Only worth showing when the user actually added contributions */}
              {result.totalContributions > 0 && (
                <div className="p-2" id='resultsBlock3'>
                  <p className="resultsLabel">Total contributions:</p>
                  <p className="resultsValue">
                    {formatCurrency(result.totalContributions)}
                  </p>
                </div>
              )}
              <div className="p-2" id='resultsBlock2'>
                <p className="resultsLabel">Final amount:</p>
                <p className="resultsValue">
                  {formatCurrency(result.finalAmount)}
                </p>
              </div>
            </Stack>
          </div>
          {result.breakdown?.length > 0 && (
            <div className="table-wrapper">
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>{breakdownHeading}</th>
                    <th>Contributions</th>
                    <th>Interest earned</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((row) => (
                    <tr key={row.period}>
                      <td>{row.period}</td>
                      <td>{formatCurrency(row.contributions)}</td>
                      <td>{formatCurrency(row.interest)}</td>
                      <td className="breakdown-table__balance">
                        {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {currentUser && (
            <div className="save-row">
              <Button
                type="button"
                /* Turns green once the calculation is safely in the user's
                history, red when the save was rejected. */
                variant={saveButtonVariant}
                onClick={handleSave}
                /* Also disabled without a username: the record is filed
                under it, so there is nothing to save it against. */
                disabled={!username || saveStatus === "saving" || saveStatus === "saved"}
                className="save-link"
                id='save-int-calcBtn'
                // ARIA ATTRIBUTES:
                aria-disabled={!username || saveStatus === "saving" || saveStatus === "saved"}
              >
                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "saved"
                  ? "Saved to history"
                  : "Save to history"}
              </Button>
              {saveStatus === "error" && (
                <span className="save-error" role='alert'>
                  {saveMessage || "Could not save. Try again."}
                </span>
              )}
              {saveStatus === "saved" && saveMessage && (
                <span className="save-success" role='status'>
                  {saveMessage}
                </span>
              )}
              {/* Explains an unusable save button before it is pressed */}
              {!username && (
                <span className="save-error">
                  Your username name could not be read from your profile, so this
                  calculation cannot be saved.
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
