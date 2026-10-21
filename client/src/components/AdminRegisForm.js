// AdminRegisForm.js
// IMPORT NECESSARY MODULES AND COMPONENTS
import React from 'react'
import '../css/componentCss/RegisterForm.css'
import '../css/componentCss/FormSetup.css'
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { ShieldUser } from 'lucide-react';

// AdminRegisForm Function component
export default function AdminRegisForm() {

    // Function to submit registerAdminForm
    /* call the setAdmin request */
    const handleAdminSubmit = (e) => {
        e.preventDefault()

    }
  return (
      <form id='registerAdminForm' method='PATCH' onSubmit={handleAdminSubmit}>
          <div id='adminInput'>
            <Stack direction="horizontal" gap={3} id='adminRegisStack'>
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
        // aria-label=''
        aria-required='false'
        >
          <option value={''}>SELECT</option>
          <option>YES</option>
          <option>NO</option>
        </select>
      </div>
      <div className="p-2 ms-auto">
        <Button>
            REGISTER AS ADMIN<ShieldUser/>
        </Button>
      </div>
      <div className="vr" />
      <div className="p-2">Third item</div>
    </Stack>
          </div>
        </form>
  )
}
