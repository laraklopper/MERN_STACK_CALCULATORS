//InterestResults.js
// IMPORT REQUIRED MODULES AND PACKAGES
import React from 'react'
import '../css/componentCss/CalculatorResults.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
// IMPORT ICONS FROM LUCIDE-REACT
import { TrendingUp } from 'lucide-react';
// IMPORT UTILITY FUNCTIONS
import { formatCurrency } from '../util/currencyFunc';

/* ---------------------------------------------------------------------------
Renders the result of an /interest/calculate request plus a period-by-period
breakdown table. Holds no state of its own: InterestCalculator.js owns the
result and the save request, and passes them in.

  result       - the result returned by /interest/calculate
  currentUser  - the logged in user; the save button only shows when there is one
  username     - the logged in user's username; saving is disabled without it
  saveStatus   - null | "saving" | "saved" | "error"
  saveMessage  - the message returned by the save request, if any
  onSave       - called when the save button is clicked */
export default function InterestResults({
  result,
  currentUser,
  username,
  saveStatus,
  saveMessage,
  onSave,
}) {
  /* Bootstrap variant for the save button, so its colour reports the outcome
  of the save rather than staying neutral once the button is disabled. */
  const saveButtonVariant =
    saveStatus === "saved" ? "success" : saveStatus === "error" ? "danger" : "light";

  /* Heading for the breakdown table's first column. Driven by the result, not
  the form, so the table always describes the figures currently on screen. */
  const breakdownHeading = result?.periodUnit === "months" ? "Month" : "Year";

  //=============JSX RENDERING=============
  return (
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
            onClick={onSave}
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
  )
}
