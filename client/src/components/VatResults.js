//VatResults.js
// IMPORT REQUIRED MODULES AND PACKAGES
import React from 'react'
import '../css/componentCss/CalculatorResults.css'
// IMPORT BOOTSTRAP COMPONENTS
import Button from 'react-bootstrap/Button';
// IMPORT ICONS FROM LUCIDE-REACT
import { Save } from 'lucide-react';
// IMPORT UTILITY FUNCTIONS
import { formatCurrency } from '../util/currencyFunc';

/* ---------------------------------------------------------------------------
Renders the result of a /vat/calculate request. Holds no state of its own:
VatCalculator.js owns the result and the save request, and passes them in.

  result       - the result returned by /vat/calculate
  currentUser  - the logged in user; the save button only shows when there is one
  saveStatus   - null | 'saving' | 'saved' | 'error'
  saveMessage  - the message returned by the save request, if any
  onSave       - called when the save button is clicked */
//VatResults function component
export default function VatResults({
  result,
  currentUser,
  saveStatus,
  saveMessage,
  onSave,
}) {
  /* Bootstrap variant for the save button, so its colour reports the outcome
  of the save rather than staying neutral once the button is disabled. */
  const saveButtonVariant =
    saveStatus === 'saved' ? 'success' : saveStatus === 'error' ? 'danger' : 'light';

  // ================JSX RENDERING===================
  return (
    <>
      <div id='vatCalculatorResults' aria-live='polite'>
        <div className="vatCalculatorResultRow">
          <span>Amount excl. VAT</span>
          <span>{formatCurrency(result.netAmount)}</span>
        </div>
        <div className="vatCalculatorResultRow">
          <span>VAT ({result.ratePercent}%)</span>
          <span>{formatCurrency(result.vatAmount)}</span>
        </div>
        <div className="vatCalculatorResultRow vatCalculatorResultRow--total">
          <span>Amount incl. VAT</span>
          <span>{formatCurrency(result.grossAmount)}</span>
        </div>
      </div>
      {currentUser ? (
        <div id='vatSaveRow'>
          <Button
            /* Turns green once the calculation is safely in the user's
            history, red when the save was rejected. */
            variant={saveButtonVariant}
            type='button'
            id='saveVatCalculationBtn'
            onClick={onSave}
            disabled={saveStatus === 'saving' || saveStatus === 'saved'}
            // ARIA ATTRIBUTES:
            aria-label='Save VAT calculation to your history'
            aria-disabled={saveStatus === 'saving' || saveStatus === 'saved'}
          >
            <Save aria-hidden='true' focusable='false' />
            {saveStatus === 'saving'
              ? 'SAVING...'
              : saveStatus === 'saved'
              ? 'SAVED TO HISTORY'
              : 'SAVE CALCULATION'}
          </Button>
          {saveStatus === 'error' && (
            <span className='vatCalculatorError' role='alert'>{saveMessage}</span>
          )}
          {saveStatus === 'saved' && saveMessage && (
            <span className='vatSaveSuccess' role='status'>{saveMessage}</span>
          )}
        </div>
      ) : (
        <p className="vatCalculatorAuthHint">
          Log in to save this calculation to your history.
        </p>
      )}
    </>
  )
}
