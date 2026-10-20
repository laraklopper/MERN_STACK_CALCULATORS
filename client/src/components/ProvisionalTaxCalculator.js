//ProvisionalTaxCalculator.js
import React, { useCallback, useEffect, useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/ProvisionalTaxCalc.css'
import '../css/componentCss/CalculatorSetup.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { AlertCircle, Asterisk, Calculator, RotateCcw, TrendingUp, CalendarClock } from 'lucide-react';
import {formatCurrency} from '../util/currencyFunc'
import {toLongDate} from '../util/'
import { BLANK_PROV_TAX_FORM, PROVISIONAL_PERIODS, provisionalPeriodConfig, formatPercent, validateProvTaxForm } from '../util/taxCalculatorFunc';
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
  setError,
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

  // Request function to calculate provisional tax
   const calculateProvTax = useCallback(async () => {
    try {
     const token = localStorage.getItem('token')
    // Add the entire endpoint
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

  // Request function to save provisional tax calculation
  const saveCalculation = useCallback (async => {
    try {
      
    } catch (error) {
      
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

  const saveButtonVariant =
    saveStatus === "saved" ? "success" : saveStatus === "error" ? "danger" : "light";
  
  // Function to submit provisional tax calculator form
  // Call the Calculate request
  const handleSubmit = (e) => {
    e.preventDefault()
    calculateProvTax()
  }
  // Function to save the calculation
  // call the save calculation request
  const handleSave =(e) => {
    e.preventDefault()
    saveCalculation()
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
      {/* Display results in the ProvisionalTaxResults.js component */}
      {/* --- Results --- */}
      
      {result && (
        <div className="results" id="prov-tax-results">
          <div className="results__header">
            <TrendingUp size={18} className="results__icon" />
            <h2 className="results__title">{result.periodLabel || period.heading}</h2>
          </div>

          {/* The date the IRP6 falls due, or nothing where the tax year has no
          dates. The API sends a plain YYYY-MM-DD, which parses as UTC midnight;
          the time is pinned on so it is read as LOCAL midnight instead and the
          date on screen cannot slip a day behind the one that was worked out. */}
          {result.dueDate && (
            <p className="prov-tax-due-date">
              <CalendarClock size={16} aria-hidden='true' focusable='false' />
              {' '}Due by {toLongDate(`${result.dueDate}T00:00:00`)}
            </p>
          )}
          <div className="results-summary">
            <div className="results-card">
              <p className="results-card__label">Tax liability for the year</p>
              <p className="results-card__value">{formatCurrency(result.annualTaxLiability)}</p>
            </div>
            <div className="results-card">
              <p className="results-card__label">Tax for this period</p>
              <p className="results-card__value">{formatCurrency(result.taxForPeriod)}</p>
            </div>
            <div className="results-card">
              <p className="results-card__label">Already withheld or paid</p>
              <p className="results-card__value">{formatCurrency(result.totalCredits)}</p>
            </div>
            <div className="results-card results-card--highlight">
              <p className="results-card__label">Amount payable</p>
              <p className="results-card__value">{formatCurrency(result.amountPayable)}</p>
            </div>
          </div>

          {/* An IRP6 cannot ask for a negative payment, so a surplus is
          reported here rather than disappearing into the floored total. */}
          {result.overpaid > 0 && (
            <p className="prov-tax-overpaid" role="status">
              Nothing is payable on this IRP6: what has already been withheld or
              paid exceeds the tax for this period by{' '}
              {formatCurrency(result.overpaid)}.
            </p>
          )}

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

          {/* The working, laid out the way an IRP6 is */}
          {result.breakdown?.length > 0 && (
            <div className="table-wrapper">
              <table className="breakdown-table" id="prov-tax-breakdown-table">
                <thead>
                  <tr>
                    <th>Working</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((row, i) => (
                    <tr key={i} className={row.type === 'total' ? 'prov-tax-total-row' : undefined}>
                      <td>{row.label}</td>
                      <td className="breakdown-table__balance">
                        {/* A deduction is written as a negative, so the column
                        reads as the sum it is rather than as a list of figures */}
                        {row.type === 'deduct' ? '−' : ''}{formatCurrency(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* What the figures cannot show: what happens if the estimate was too
          low, or the payment is made late. */}
          {result.warnings?.length > 0 && (
            <ul className="prov-tax-warnings">
              {result.warnings.map((warning, i) => (
                <li key={i} className="prov-tax-warning">
                  <AlertCircle size={14} aria-hidden='true' focusable='false' /> {warning}
                </li>
              ))}
            </ul>
          )}

          <p className="disclaimer">
            This calculator is for estimation purposes only and does not
            constitute tax advice. Consult SARS or a registered tax practitioner
            before submitting an IRP6.
          </p>

          {currentUser && (
            <div className="save-row">
              <Button
                type="button"
                /* Turns green once the calculation is safely in the user's
                history, red when the save was rejected. */
                variant={saveButtonVariant}
                id="saveProvTaxCalculationBtn"
                onClick={handleSave}
                disabled={saveStatus === "saving" || saveStatus === "saved"}
                className="save-link"
                // ARIA ATTRIBUTES
                aria-disabled={saveStatus === "saving" || saveStatus === "saved"}
                aria-label='save calculation'
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
