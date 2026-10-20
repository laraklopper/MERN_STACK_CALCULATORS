//IncomeTaxResults.js
// IMPORT REQUIRED MODULES AND PACKAGES
import React from 'react'
import '../css/componentCss/CalculatorResults.css'
// IMPORT BOOTSTRAP COMPONENTS
import Button from 'react-bootstrap/Button';
// IMPORT ICONS FROM LUCIDE-REACT
import { Save, TrendingUp } from 'lucide-react'
// IMPORT UTILITY FUNCTIONS
import { formatPercent } from '../util/calculatorFunc'
import { formatCurrency } from '../util/currencyFunc';

/* ---------------------------------------------------------------------------
Renders the result of a /tax/calculate request. Holds no state of its own:
IncomeTaxCalculator.js owns the result and the save request, and passes them in.

  result       - the result returned by /tax/calculate
  currentUser  - the logged in user; the save button only shows when there is one
  saveStatus   - null | "saving" | "saved" | "error"
  onSave       - called when the save button is clicked */
//IncomeTaxResults function component
export default function IncomeTaxResults({
  result,
  currentUser,
  saveStatus,
  onSave,
}) {
  /* Bootstrap variant for the save button, so its colour reports the outcome
  of the save rather than staying neutral once the button is disabled. */
  const saveButtonVariant =
    saveStatus === "saved" ? "success" : saveStatus === "error" ? "danger" : "light";

  //===========JSX RENDERING======================
  return (
    <div className="results">
      <div className="resultsHeader">
        <TrendingUp size={28} color=' #1b9891' className="results__icon" />
        <h2 className="resultsTitle">Result</h2>
      </div>
      <div className="resultsSummary">
        <div className="resultsDiv">
          <p className="resultsLabel">Gross tax</p>
          <p className="resultsValue">{formatCurrency(result.grossTax)}</p>
        </div>
        <div className="resultsDiv">
          <p className="resultsLabel">Rebate applied</p>
          <p className="resultsValue">{formatCurrency(result.rebate)}</p>
        </div>
        <div className="resultsDiv resultsDiv--highlight">
          <p className="resultsLabel">Net tax payable</p>
          <p className="resultsValue">{formatCurrency(result.netTax)}</p>
        </div>
      </div>
      <div className="resultsSummary results-summary--rates">
        <div className="ratePill">
          <span className="ratePillLabel">Effective rate</span>
          <span className="ratePillValue">{formatPercent(result.effectiveRate)}</span>
        </div>
        <div className="ratePill">
          <span className="ratePillLabel">Marginal rate</span>
          <span className="ratePillValue">{formatPercent(result.marginalRate)}</span>
        </div>
      </div>
      {result.bracketBreakdown?.length > 0 && (
        <div className="table-wrapper">
          <table className="breakdownTable">
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
        constitute tax advice. <br/>Consult <strong>SARS</strong> or a registered tax
        practitioner for official calculations.
      </p>
      {/* SAVE */}
      {currentUser && (
        <div className="save-row">
          <Button
            type="button"
            /* Turns green once the calculation is safely in the user's
            history, red when the save was rejected. */
            variant={saveButtonVariant}
            id="saveTaxCalculationBtn"
            onClick={onSave}
            disabled={saveStatus === "saving" || saveStatus === "saved"}
            className="save-link"
          >
          <Save/>
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
  )
}
