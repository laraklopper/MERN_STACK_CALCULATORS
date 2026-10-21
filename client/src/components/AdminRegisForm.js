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
export default function AdminRegisForm() {

    // Function to submit registerAdminForm
    /* call the setAdmin request */
    const handleAdminSubmit = (e) => {
        e.preventDefault()

    }
  return (
      <form id='registerAdminForm' method='PATCH' onSubmit={handleAdminSubmit}>
         
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
      <div className="p-2">
        <Button
        variant='danger'
        id='exitAdminFormBtn'
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
