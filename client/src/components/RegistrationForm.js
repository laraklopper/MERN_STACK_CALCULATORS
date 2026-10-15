import React, { useState } from 'react'
import '../css/componentCss/FormSetup.css'
import '../css/componentCss/RegisterForm.css'
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import { Eye, EyeOff, Asterisk, Bug  } from 'lucide-react';

export default function RegistrationForm({newUserData, setNewUserData}) {
    // ==========STATE VARIABLES==============
    //state to display password
    const [showPassword, setShowPassword] = useState(false)
    const [emailMsg, setEmailMsg] = useState(false)
    // State to controls whether the password helper message is displayed
    const [pswdmsg, setPswdMsg] = useState(false)
    // const [touched, setTouched] = useState({})

    const handleChange = (event) =>{
        // Extract the properties from the event.target
        const { name, value, type, checked } = event.target

     // Determine the new value based on the input type
        // If the input type is 'checkbox', use `checked`, otherwise use `value`
        const fieldValue = type === 'checkbox' ? checked : value
        // Handle non nested fields 
            setNewUserData((prev) => ({
                ...prev,
                [name]: fieldValue,
            }))
    }
    //========== EMPTY FIELD VALIDATION ====================

    //===========JSX RENDERING=============
  return (
    <form id='registrationForm' aria-labelledby='formTitle'>
     {/* --------Screen Reader Heading----------- */}
    <p className='visually-hidden' id='formTitle'>REGISTRATION FORM</p>
        <div id='formHeadingBlock'>
            <h3 id='formHeading'>SIGN UP</h3>
        </div>
        {/* ============MAIN REGISTRATION INPUT BLOCK============ */}
        <div id='registerInput' aria-describedby='mainInputDescrip'>
        {/* --------Screen Reader Heading description----------- */}
                <p className='visually-hidden' id='mainInputDescrip'>
                    MAIN USER REGISTRATION DETAILS INPUT
                </p>
        {/*  GROUP 1: username, email, date of birth*/}
            <div id='regisGroup1'>
            {/* STACK 1: USERNAME */}
            <Stack direction="horizontal" gap={3} id='regisStack1'>
      <div className="p-2" id='regisUsernameBlock'>
        {/*  username*/}
        <div className='inputDiv'>
        <label className='regisLabel'>USERNAME:</label>
            <input
                type='text'
                id='regisUsername'
                className='input'
                required
                autoComplete='username'
                name='username'
                value={newUserData.username}
                onChange={handleChange}
            />
            <Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' />
        </div>
        <div>
           <span className='formErrorSpan'>
            <Bug color="#C22419" fontWeight={700} size={16} aria-hidden='true' focusable='false'/><p>Username is required</p>
        </span>
        </div>
      </div>
      <div className="p-2 ms-auto"></div>
      <div className="p-2"></div>
    </Stack>
    {/* STACK 2: EMAIL */}
<Stack direction="horizontal" gap={3} id='regisStack2'>
      <div className="p-2" id="regisEmailBlock">
        <div className='inputDiv'>
        <label className='regisLabel' htmlFor='regisEmailInput'>EMAIL:</label>
            <input
                className='input'
                id='regisEmailInput'
                type='email'
                required
                placeholder='EMAIL'
                name='email'
                value={newUserData.email}
                inputMode='email'
                onChange={handleChange}
                onFocus={()=>  setEmailMsg (true) }
                onBlur={() => setEmailMsg(false)}
                // ARIA ATTRIBUTES
                aria-required='true'
            />
            <Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' />
        </div>
          {/* REQUIRED MESSAGE */}
        <span className='formErrorSpan' aria-live='assertive'>
        <Bug color="#C22419" fontWeight={700} size={16} aria-hidden='true' focusable='false'/><p className='errorText'>Email is required</p>
        </span>
      </div>
      <div className="p-2 ms-auto"></div>
      {emailMsg && (
        <div className="p-2" aria-live='polite'>
            <p className='msgText'>We will never share your email</p>
        </div>

      )}
    </Stack>
    {/* STACK 3: DATE OF BIRTH */}
                 <Stack direction="horizontal" gap={3} id='regisStack3'>
                 {/* Date of Birth */}
      <div className="p-2" id='regisBirthDateBlock'>
        <div className='inputDiv'>
        <label className='regisLabel'>DATE OF BIRTH:</label>
            <input
                type='date'
                className='input'
                id='regisDateInput'
                required
            />
            <Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' />
        </div>
  
          <span className='formErrorSpan'>
             <Bug color="#C22419" fontWeight={700} size={16} aria-hidden='true' focusable='false'/><p className='errorText'>Email is required</p>
          </span>
        
      </div>
      <div className="p-2 ms-auto"></div>
      <div className="p-2">
        <p>All users must be 16 years or older</p>
      </div>
    </Stack>    
            </div>
            {/* PASSWORD AND ADMIN */}
            <div id='regisGroup2'>
            {/* STACK 4: PASSWORD */}
            <Stack direction="horizontal" gap={3} id='regisStack4'>
      <div className="p-2" id='regisPswdBlock'>
        <div className='inputDiv'>
        <label className='regisLabel' htmlFor='regisPassword'>PASSWORD: </label>
            <input
                type={showPassword ? 'text': 'password'}
                id='regisPassword'
                className='input'
                required
                placeholder='PASSWORD'
                name='password'
                value={newUserData.password}
                onChange={handleChange}
                onFocus={() => setPswdMsg(true)}
                onBlur={() => setPswdMsg(false)}
                aria-label='password input'
                aria-required='true'
            />
            <Button 
                id='showPswdButton' 
                variant='warning' 
                onClick={() => setShowPassword(!showPassword)}
                type='button'
                // ARIA ATTRIBUTES
                aria-label={showPassword ? 'Hide Password': 'Show password'}
                aria-pressed={showPassword}
                aria-expanded={showPassword}
                >
                {showPassword ? <Eye size={16}  aria-hidden='true' focusable='false' /> : <EyeOff size={16}   aria-hidden='true' focusable='false' />}
            </Button>
            <Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' />
        </div>
        <span className='formErrorSpan'>
        <Bug color="#C22419" fontWeight={700} size={16} aria-hidden='true' focusable='false'/><p className='errorText'>Password is required</p>
        </span>
         <p className='reqText'>Password must be at least 8 characters long and <br/>must contain at least 1 special character</p>
      </div>
      
      <div className="p-2 ms-auto">
       
      </div>
      {pswdmsg && (
<div className="p-2">
  <p className='msgText'>We will never share your password</p>
</div>
      )}
      
    </Stack>
    {/* STACK 5: ADMIN REGISTRATION */}
    <Stack direction="horizontal" gap={3} id='regisStack5'>
      <div className="p-2" id='adminRegisBlock'>
        <label className='regisLabel' htmlFor='regisAdmin'>REGISTER AS ADMIN</label>
        <input
            type='checkbox'
            id='regisAdmin'
            // name=''
            // checked={}
            // onChange={}
            // ARIA ATTRIBUTES:
            aria-label='Register as admin'
            aria-required='false'
        />
      </div>
      <div className="p-2 ms-auto"/>
      <div className="p-2">
        {/* ADMIN REQUIREMENS */}
        <p className='reqText'>Admin Users must be at least 18 years old</p>
      </div>
    </Stack>

            </div>
        </div>
        {/* ====END OF INPUT============= */}
        <div id='regisGroup3'>
<Stack direction="horizontal" gap={3} id='regisActionsStack'>
      <div className="p-2" id='requiredInfo'>
            <p className='infoText' aria-live='polite' aria-hidden='true'>
                <small><Asterisk color="#C22419" fontWeight={700} size={14} aria-hidden='true' focusable='false' /> Indicates required information</small>
            </p>
        </div>
      <div className="p-2 ms-auto">
        <Button 
          variant='danger' 
          type='button' 
          id='clearFormBtn' 
          // onClick={}
          // disabled=
          // ARIA ATTRIBUTES
          aria-label='clearForm button'>CLEAR FORM</Button>
      </div>
      <div className="vr" style={{ color: '#404040', opacity: .50, width: '2px' }} />
      <div className="p-2">
        <Button 
        variant='light' 
        type='submit' 
        id='regisBtn'
        aria-label='register button'
        role='button'
        >REGISTER</Button>
      </div>
    </Stack>
        </div>
    </form>
  )
}
