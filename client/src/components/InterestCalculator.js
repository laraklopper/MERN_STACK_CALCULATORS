import React, { useState } from 'react'
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import {  AlertCircle, Asterisk } from "lucide-react";
import { BLANK_INTEREST_FORM } from '../util/calculatorFunc';

export default function InterestCalculator() {
   const [form, setForm] = useState(BLANK_INTEREST_FORM);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null); // null | "calculating" | "error"
  const [statusMessage, setStatusMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "saved" | "error"
  const [saveMessage, setSaveMessage] = useState("");

   const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

    const resetForm = () => {
    setForm(BLANK_INTEREST_FORM);
    setErrors({});
    setResult(null);
    setStatus(null);
    setSaveStatus(null);
    setSaveMessage("");
    /* The FULL NAME fields are not reset: they are read from the logged in
    user rather than entered, so there is nothing of the user's to clear. */
  };

  return (
    <div>
      <form>
        <div id='formHeadingBlock'>
          <h3 id='calculatorHeading'>INTEREST CALCULATOR</h3>
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
      <div id='interestCalculatorDetails'>
        <div id='fieldGroup1'>
        {/* STACK 1 */}
           <Stack gap={3} id='interestFormStack1'>
      <div className="p-2">
        <label className="field-label">Interest type:</label><small><Asterisk color="#C22419" fontWeight={700} size={14} aria-hidden='true' focusable='false' /></small>
                  {/* Interest Type Buttons */}
            <div className='button-div'>
                  {["simple", "compound"].map((t) => (
                    <Button
                    variant="light"
                      key={t}
                      type="button"
                      onClick={() => updateField("type", t)}
                      id='interest-type-selectbtn'
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
      <div className="p-2">Second item</div>
      <div className="p-2">Third item</div>
    </Stack>

        </div>

      </div>
      </form>
    </div>
  )
}
