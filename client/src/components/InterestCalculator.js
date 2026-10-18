import React, { useState } from 'react'
import '../css/componentCss/InterestCalculator.css'
import '../css/componentCss/FormSetup.css'
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
  
      <form id='interestCalculator'>
        <div id='intCalculatorHeadBlock'>
          <h3 id='interestCalculatorHeading'>INTEREST CALCULATOR</h3>
          <span className='formTextSpan'>
             <p className="formText">
            Calculate how much interest you'll earn or owe over time, <br/>using
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
        <div id='interestCalculatorGroup2'>
          <Stack gap={3}>
      <div className="p-2">First item</div>
      <div className="p-2">Second item</div>
      <div className="p-2">Third item</div>
    </Stack>

        </div>

      </div>
      </form>
    
  )
}
