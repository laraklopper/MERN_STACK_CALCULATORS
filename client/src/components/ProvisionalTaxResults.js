//ProvisionalTaxResults.js
// IMPORT REQUIRED MODULES AND PACKAGES
import React from 'react'
// IMPORT BOOTSTRAP COMPONENTS
import Button from 'react-bootstrap/Button';
// IMPORT ICONS FROM LUCIDE-REACT
import { AlertCircle, CalendarClock, TrendingUp } from 'lucide-react';
// IMPORT UTILITY FUNCTIONS
import { formatCurrency } from '../util/currencyFunc'
import { toLongDate } from '../util/dateFunctions'
import { formatPercent } from '../util/calculatorFunc';

/* ---------------------------------------------------------------------------
Renders the result of a /provisional/calculate request the way an IRP6 is laid
out. Holds no state of its own: ProvisionalTaxCalculator.js owns the result and
the save request, and passes them in.

  result       - the result returned by /provisional/calculate
  heading      - shown when the result carries no periodLabel of its own
  currentUser  - the logged in user; the save button only shows when there is one
  saveStatus   - null | "saving" | "saved" | "error"
  onSave       - called when the save button is clicked */
export default function ProvisionalTaxResults({
  result,
  heading,
  currentUser,
  saveStatus,
  onSave,
}) {
  /* Bootstrap variant for the save button, so its colour reports the outcome
  of the save rather than staying neutral once the button is disabled. */
  const saveButtonVariant =
    saveStatus === "saved" ? "success" : saveStatus === "error" ? "danger" : "light";

  //=============JSX RENDERING=============
  return (
    <div className="results" id="prov-tax-results">
      <div className="results__header">
        <TrendingUp size={18} className="results__icon" />
        <h2 className="results__title">{result.periodLabel || heading}</h2>
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
            onClick={onSave}
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
  )
}
