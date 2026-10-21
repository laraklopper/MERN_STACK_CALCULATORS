// AdminRegisForm.js
// IMPORT NECESSARY MODULES AND PACKAGES
import React from 'react'
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
    {
        setAdmin
    }
) {

    // Function to submit registerAdminForm
    /* call the setAdmin request */
    const handleAdminSubmit = (e) => {
        e.preventDefault()
        setAdmin()
    }
    // Function to exit register as admin
    const exitForm = () => {
        const confirmExit = window.confirm(
            'Are you sure you want to exit admin status'
        )
        if (!confirmExit) return;
    }
    
    //===========JSX RENDERING=================
  return (
      <form id='registerAdminForm' method='PATCH' onSubmit={handleAdminSubmit}>
         <p>FORM TO REGISTER AS ADMIN</p>
            <Stack direction="horizontal" gap={3} id='adminInput'>
      <div className="p-2" id='adminRegisBlock'>
        <label id='adminLabel' htmlFor='regisAdmin'>
          REGISTER AS ADMIN:
        </label>
        <select
        id='regisAdmin'
        // name=''
        // value={}
        // onChange={}//set inline changes
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
        >
            REGISTER AS ADMIN<ShieldUser/>
        </Button>
      </div>
      <div className="vr" />
{/* EXIT FORM BUTTON: if user clicks exit do not display form again */}
      <div className="p-2">
        <Button
        variant='danger'
        id='exitAdminFormBtn'
        type='button'
        >
            EXIT<X/>
        </Button>
      </div>
    </Stack>
         
          <div id='adminMessageDiv'>
            <Stack gap={2} className="col-md-5 mx-auto" id='adminMsgStack'>
                <p className='infoText' id='adminMsg'>THIS OPTION IS ONLY AVAILABLE ONCE</p>
            </Stack>
          </div>
        </form>
  )
}
