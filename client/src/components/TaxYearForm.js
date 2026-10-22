//TaxYearForm.js (admin only)
// IMPORT REQUIRED MODULES AND PACKAGES
import React, { useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/CalculatorSetup.css'
import '../css/componentCss/TaxYearForm.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
// IMPORT ICONS FROM LUCIDE-REACT
import { AlertCircle, CalendarPlus, Asterisk, Plus, RotateCcw, Trash2 } from 'lucide-react'

/* Form for admin users to add a new SARS tax year. Sends a POST request to
/tax/config (taxRoutes.js), which checks the user is an admin, validates the
figures and saves them as a TaxYearConfig document.

Only the start year is entered: the tax year name ("2026-2027") and its dates
(1 March to the end of February) are worked out from it. Each bracket's minimum
is also worked out - R1 for the first bracket, then R1 more than the previous
bracket's maximum - so the brackets cannot overlap or leave gaps. */

const emptyBracket = { max: '', baseAmount: '', rate: '' }

const BLANK_TAX_YEAR_FORM = {
  startYear: '',
  brackets: [{ ...emptyBracket }],
  rebates: { primary: '', secondary: '', tertiary: '' },
  thresholds: { under65: '', age65to74: '', age75plus: '' },
}

// Labels for the rebate and threshold inputs (keys match the form state)
const REBATE_FIELDS = [
  { key: 'primary', label: 'Primary (all taxpayers)' },
  { key: 'secondary', label: 'Secondary (age 65+)' },
  { key: 'tertiary', label: 'Tertiary (age 75+)' },
]
const THRESHOLD_FIELDS = [
  { key: 'under65', label: 'Under 65' },
  { key: 'age65to74', label: 'Age 65 to 74' },
  { key: 'age75plus', label: 'Age 75+' },
]

// Returns the tax year name for a start year, e.g. 2026 -> "2026-2027"
const toTaxYear = (startYear) => {
  const year = Number(startYear)
  return /^\d{4}$/.test(String(startYear)) ? `${year}-${year + 1}` : ''
}

// Returns the minimum of each bracket: R1 for the first, then the previous max + 1
const bracketMins = (brackets) =>
  brackets.map((_, i) => {
    if (i === 0) return 1
    const prevMax = brackets[i - 1].max
    return prevMax === '' ? '' : Number(prevMax) + 1
  })

// Checks a form value is a number of 0 or more
const isAmount = (value) => value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0

/* Function to validate the form before it is sent. Returns a message describing
the first problem found, or null. The server repeats these checks (and more),
because the browser's copy can be bypassed. */
const validateTaxYearForm = (form) => {
  if (!toTaxYear(form.startYear)) return 'Enter the start year as 4 digits, e.g. 2026'

  const mins = bracketMins(form.brackets)
  for (let i = 0; i < form.brackets.length; i++) {
    const { max, baseAmount, rate } = form.brackets[i]
    const row = `Bracket ${i + 1}`
    const isLast = i === form.brackets.length - 1

    if (!isLast && !isAmount(max)) return `${row}: enter a maximum (only the last bracket has no maximum)`
    if (!isLast && Number(max) < mins[i]) return `${row}: the maximum cannot be less than R${mins[i]}`
    if (!isAmount(baseAmount)) return `${row}: enter a base amount (0 for the first bracket)`
    if (!isAmount(rate) || Number(rate) > 100) return `${row}: enter a rate between 0 and 100%`
  }
  if (!REBATE_FIELDS.every(({ key }) => isAmount(form.rebates[key]))) return 'Enter all three rebates'
  if (!THRESHOLD_FIELDS.every(({ key }) => isAmount(form.thresholds[key]))) return 'Enter all three tax thresholds'
  return null
}

/* Function to convert the form into the body POST /tax/config expects.
Rates are entered as percentages and sent as decimals (18 -> 0.18). */
const toTaxYearPayload = (form) => {
  const mins = bracketMins(form.brackets)
  const toNumbers = (group) =>
    Object.fromEntries(Object.entries(group).map(([key, value]) => [key, Number(value)]))

  return {
    taxYear: toTaxYear(form.startYear),
    brackets: form.brackets.map((b, i) => ({
      min: mins[i],
      max: i === form.brackets.length - 1 ? null : Number(b.max),
      baseAmount: Number(b.baseAmount),
      // Rounded so floating point maths cannot send 0.18000000000000002
      rate: Math.round(Number(b.rate) * 1000) / 100000,
    })),
    rebates: toNumbers(form.rebates),
    thresholds: toNumbers(form.thresholds),
  }
}

export default function TaxYearForm({ onTaxYearAdded }) {
  const [form, setForm] = useState(BLANK_TAX_YEAR_FORM)
  const [status, setStatus] = useState(null) // null | "saving" | "saved" | "error"
  const [statusMessage, setStatusMessage] = useState('')

  const taxYear = toTaxYear(form.startYear)
  const mins = bracketMins(form.brackets)

  // Clear the last save message once the admin starts editing again
  const clearStatus = () => {
    if (status !== 'saving') {
      setStatus(null)
      setStatusMessage('')
    }
  }

  // Update a field in a nested group, e.g. updateGroup('rebates', 'primary', '17235')
  const updateGroup = (group, key, value) => {
    setForm((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }))
    clearStatus()
  }

  // Update one field of one bracket row
  const updateBracket = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      brackets: prev.brackets.map((b, i) => (i === index ? { ...b, [key]: value } : b)),
    }))
    clearStatus()
  }

  const addBracket = () => {
    setForm((prev) => ({ ...prev, brackets: [...prev.brackets, { ...emptyBracket }] }))
    clearStatus()
  }

  const removeBracket = (index) => {
    setForm((prev) => ({ ...prev, brackets: prev.brackets.filter((_, i) => i !== index) }))
    clearStatus()
  }

  const resetForm = () => {
    setForm(BLANK_TAX_YEAR_FORM)
    setStatus(null)
    setStatusMessage('')
  }

  /* Function to submit the form: validates it, then sends a POST request to
  /tax/config. On success the form is cleared and the parent (Tax.js) reloads
  the tax year dropdowns. */
  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationMessage = validateTaxYearForm(form)
    // Conditional rendering to stop the request when a field is unusable
    if (validationMessage) {
      setStatus('error')
      setStatusMessage(validationMessage)
      return
    }

    setStatus('saving')
    setStatusMessage('')
    try {
      const token = localStorage.getItem('token')
      // Send a POST request to the /tax/config endpoint
      const response = await fetch('http://localhost:3001/tax/config', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`// Attach the token in the Authorization header
        },
        body: JSON.stringify(toTaxYearPayload(form))
      })
      const data = await response.json().catch(() => ({}));// Safely parse the JSON response (avoid crash if server returns non-JSON)

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      setForm(BLANK_TAX_YEAR_FORM)
      setStatus('saved')
      setStatusMessage(data.message || `The ${taxYear} tax year was added`)
      onTaxYearAdded?.()
    } catch (error) {
      console.error('[ERROR: TaxYearForm.js, handleSubmit]: Error adding tax year:', error.message);//Log an error message in the console for debugging purposes
      setStatus('error')
      setStatusMessage(error.message || 'Could not add the tax year. Try again.')
    }
  }

  //===========JSX RENDERING======================
  return (
    <div id='taxYearFormContainer'>
      <form id='taxYearForm' method='POST' onSubmit={handleSubmit} aria-labelledby='taxYearFormHeading' noValidate>
        {/* HEADING */}
        <div id='calculatorHeadingBlock'>
          <Stack gap={3}>
            <div className="p-2">
              <h3 id="taxYearFormHeading" className='taxYearFormHeading'>Add a tax year</h3>
            </div>
            <div className="p-2 calculatorTextSpan">
              <p className="calculatorText">
                Enter the SARS figures for the new tax year.
              </p>
            </div>
          </Stack>
        </div>
        {/* GROUP 1: TAX YEAR */}
        <fieldset className='taxYearGroup'>
          <legend className='calculatorLabel taxYearLegend'>Tax year</legend>
          <div className='taxYearField'>
            <label className='addTaxYearLabel' htmlFor='taxYearStartInput'>Start year:</label>
            <div className='inputDiv'>        
            <input
              id='taxYearStartInput'
              type='number'
              min='2000'
              max='2100'
              step='1'
              placeholder='2026'
              className='calculatorInput'
              value={form.startYear}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, startYear: e.target.value }))
                clearStatus()
              }}
              required
              aria-required='true'
              aria-describedby='taxYearPreview'
            />
            <Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' />
             </div>
            <p className='calcFormText' id='taxYearPreview' aria-live='polite'>
              {taxYear
                ? `${taxYear}: 1 March ${form.startYear} to end of February ${Number(form.startYear) + 1}`
                : 'The tax year runs from 1 March to the end of February'}
            </p>
          </div>
        </fieldset>
        {/* GROUP 2: TAX BRACKETS */}
        <fieldset className='taxYearGroup'>
          <legend className='calculatorLabel taxYearLegend'>Tax brackets</legend>
          <p className='calcFormText' id='taxBracketText'>
            Enter the brackets from lowest to highest. Each minimum is filled in for you.
            Leave the last bracket's maximum blank (no ceiling).
          </p>
          <div className='table-wrapper'>
            <table className='taxYearBracketTable'>
              <thead>
                <tr>
                  <th scope='col'>#</th>
                  <th scope='col'>Min (R)</th>
                  <th scope='col'>Max (R)</th>
                  <th scope='col'>Base amount (R)</th>
                  <th scope='col'>Rate (%)</th>
                  <th scope='col'><span className='visually-hidden'>Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {form.brackets.map((bracket, i) => {
                  const isLast = i === form.brackets.length - 1
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{mins[i] === '' ? '-' : mins[i]}</td>
                      <td>
                        {isLast ? (
                          <span className='calcFormText'>No maximum</span>
                        ) : (
                          <input
                            type='number'
                            min='0'
                            step='1'
                            className='taxYearTableInput'
                            value={bracket.max}
                            onChange={(e) => updateBracket(i, 'max', e.target.value)}
                            aria-label={`Bracket ${i + 1} maximum`}
                          />
                        )}
                      </td>
                      <td>
                        <input
                          type='number'
                          min='0'
                          step='1'
                          className='taxYearTableInput'
                          value={bracket.baseAmount}
                          onChange={(e) => updateBracket(i, 'baseAmount', e.target.value)}
                          aria-label={`Bracket ${i + 1} base amount`}
                        />
                      </td>
                      <td>
                        <input
                          type='number'
                          min='0'
                          max='100'
                          step='0.01'
                          className='taxYearTableInput'
                          value={bracket.rate}
                          onChange={(e) => updateBracket(i, 'rate', e.target.value)}
                          aria-label={`Bracket ${i + 1} rate in percent`}
                        />
                      </td>
                      <td>
                        <Button
                          type='button'
                          variant='light'
                          className='taxYearRemoveBtn'
                          onClick={() => removeBracket(i)}
                          disabled={form.brackets.length === 1}
                          aria-label={`Remove bracket ${i + 1}`}
                        >
                          <Trash2 size={16} aria-hidden='true' focusable='false' />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Button type='button' variant='light' id='addBracketBtn' onClick={addBracket}>
            <Plus size={16} aria-hidden='true' focusable='false' /> Add bracket
          </Button>
        </fieldset>
        {/* GROUP 3: REBATES AND THRESHOLDS */}
        <div className='taxYearGroupRow'>
          <fieldset className='taxYearGroup'>
            <legend className='calculatorLabel taxYearLegend'>Rebates (R)</legend>
            {REBATE_FIELDS.map(({ key, label }) => (
              <div className='taxYearField' key={key}>
                <label className='addTaxYearLabel' htmlFor={`rebate-${key}`}>{label}:</label>
                <div className='inputDiv'>
                <input
                  id={`rebate-${key}`}
                  type='number'
                  min='0'
                  step='1'
                  className='calculatorInput'
                  value={form.rebates[key]}
                  onChange={(e) => updateGroup('rebates', key, e.target.value)}
                  required
                  aria-required='true'
                />
                <Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' />
                </div>
              </div>
            ))}
          </fieldset>
          <fieldset className='taxYearGroup'>
            <legend className='calculatorLabel taxYearLegend'>Tax thresholds (R)</legend>
            <div>
{THRESHOLD_FIELDS.map(({ key, label }) => (
              <div className='taxYearField' key={key}>
                <label className='addTaxYearLabel' htmlFor={`threshold-${key}`}>{label}:</label>
                <div className='inputDiv'>
                <input
                  id={`threshold-${key}`}
                  type='number'
                  min='0'
                  step='1'
                  className='calculatorInput'
                  value={form.thresholds[key]}
                  onChange={(e) => updateGroup('thresholds', key, e.target.value)}
                  required
                  aria-required='true'
                />
                 <Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' />
              </div>
              </div>
            ))}
            
            </div>
            
            
          </fieldset>
          
        </div>
        
        {/* STATUS MESSAGES */}
        {status === 'error' && (
          <div className='taxYearAlert taxYearAlert--error' role='alert'>
            <AlertCircle size={16} aria-hidden='true' focusable='false' /> {statusMessage}
          </div>
        )}
        {status === 'saved' && (
          <div className='taxYearAlert taxYearAlert--success' role='status'>
            {statusMessage}. It is now available in the tax calculators.
          </div>
        )}

        {/* GROUP 4: FORM ACTIONS(BUTTONS) */}
            <Stack direction="horizontal" gap={3} id='taxYearActions'>
      <div className="p-2" id='requiredInfo'>
                        <p className='infoText' aria-hidden='true'>
                            <small><Asterisk color="#C22419" fontWeight={700} size={14} aria-hidden='true' focusable='false' /> Indicates required information</small>
                        </p>
                    </div>
      <div className="p-2 ms-auto">
        <Button
            type='submit'
            id='submitCalculatorBtn'
            variant='light'
            disabled={status === 'saving'}
            aria-disabled={status === 'saving'}
          >
            <CalendarPlus size={16} aria-hidden='true' focusable='false' />
            {status === 'saving' ? 'Saving...' : 'Add tax year'}
          </Button>
      </div>
      <div className="p-2">
         <Button
            type='button'
            id='clearCalculatorBtn'
            variant='danger'
            onClick={resetForm}
            disabled={status === 'saving'}
            aria-disabled={status === 'saving'}
          >
            <RotateCcw size={16} aria-hidden='true' focusable='false' /> Reset
          </Button>
      </div>
    </Stack>
     
      </form>
    </div>
  )
}
