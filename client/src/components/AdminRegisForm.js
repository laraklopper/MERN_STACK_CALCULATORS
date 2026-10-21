// AdminRegisForm.js
// IMPORT NECESSARY MODULES AND PACKAGES
import React, { useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/RegisterForm.css'
import '../css/componentCss/FormSetup.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
// IMPORT ICONS FROM LUCIDE REACT
import { ShieldUser, X } from 'lucide-react';
// IMPORT UTILITY FUNCTIONS
import { ADMIN_STATUS } from '../util/utilFunctions';

// AdminRegisForm Function component
export default function AdminRegisForm(
    {//PROPS PASSED FROM PARENT COMPONENT(Home.js)
        setAdmin,
        exitAdminForm
    }
) {
    // ==========STATE VARIABLES==============
    // State to hold the selected admin status (YES / NO)
    const [adminStatus, setAdminStatus] = useState('')
    // State to disable the buttons while the request is in progress
    const [submitting, setSubmitting] = useState(false)

    // Function to exit register as admin
    /* if the user confirms, do not display the form again */
    const exitForm = () => {
        const confirmExit = window.confirm(
            'Are you sure you want to exit? This option is only available once'
        )
        if (!confirmExit) return;
        exitAdminForm?.()
    }

    // Function to submit registerAdminForm
    /* call the setAdmin request if YES is selected, exit the form if NO is selected */
    const handleAdminSubmit = async (e) => {
        e.preventDefault()
        if (adminStatus === 'NO') return exitForm()
        if (adminStatus !== 'YES') return
        setSubmitting(true)
        try {
            await setAdmin?.()
        } finally {
            setSubmitting(false)
        }
    }

    //===========JSX RENDERING=================
  return (
      <form id='registerAdminForm' method='PATCH' onSubmit={handleAdminSubmit} aria-labelledby='adminFormTitle'>
         <p id='adminFormTitle'>FORM TO REGISTER AS ADMIN</p>
            <Stack direction="horizontal" gap={3} id='adminInput'>
      <div className="p-2" id='adminRegisBlock'>
        <label id='adminLabel' htmlFor='regisAdmin'>
          REGISTER AS ADMIN:
        </label>
        <select
        id='regisAdmin'
        name='adminStatus'
        value={adminStatus}
        onChange={(e) => setAdminStatus(e.target.value)}
        disabled={submitting}
        // ARIA ATTRIBUTES
        aria-label='Select Admin Status'
        aria-required='false'
        >
          <option value={''}>SELECT</option>
          {ADMIN_STATUS.map((status) => (
            <option key={status} value={status}>
                {status}
            </option>
          ))}
        </select>
      </div>
      <div className="p-2 ms-auto">
        <Button
        variant='light'
        id='regisAsAdminBtn'
        type='submit'
        disabled={!adminStatus || submitting}// Prevent submission until a status is selected
        // ARIA ATTRIBUTES
        aria-busy={submitting}
        >
            {submitting ? 'REGISTERING...' : 'REGISTER AS ADMIN'}<ShieldUser aria-hidden='true' focusable='false'/>
        </Button>
      </div>
      <div className="vr" />
{/* EXIT FORM BUTTON: if user clicks exit do not display form again */}
      <div className="p-2">
        <Button
        variant='danger'
        id='exitAdminFormBtn'
        type='button'
        onClick={exitForm}
        disabled={submitting}
        // ARIA ATTRIBUTES
        aria-label='Exit admin registration form'
        >
            EXIT<X aria-hidden='true' focusable='false'/>
        </Button>
      </div>
    </Stack>

          <div id='adminMessageDiv'>
            <Stack gap={2} className="col-md-5 mx-auto" id='adminMsgStack'>
                <p className='infoText' id='adminMsg'>THIS OPTION IS ONLY AVAILABLE ONCE</p>
                <p className='reqText'>Admin users must be 21 years or older</p>
            </Stack>
          </div>
        </form>
  )
}
