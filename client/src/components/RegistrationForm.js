import React, { useMemo, useState } from 'react'
import '../css/componentCss/FormSetup.css'
import '../css/componentCss/RegisterForm.css'
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import { Eye, EyeOff, Asterisk, Bug  } from 'lucide-react';

// Same rules as the server (middleware.js checkPassword / userSchema.js email)
// so the user sees the error before the request is sent
const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegistrationForm({newUserData, setNewUserData, addUser}) {
    // ==========STATE VARIABLES==============
    //state to display password
    const [showPassword, setShowPassword] = useState(false)
    const [emailMsg, setEmailMsg] = useState(false)
    // State to controls whether the password helper message is displayed
    const [pswdmsg, setPswdMsg] = useState(false)
    // State to disable the register button while the request is in progress
    const [submitting, setSubmitting] = useState(false)
    const [touched, setTouched] = useState({
          username: false,
          email: false,
          dateOfBirth: false,
          password: false,
          admin: false,
        })

    // Mark a field as touched when it loses focus so its errors can be shown
    const handleBlur = (event) => {
        const { name } = event.target
        setTouched((prev) => ({ ...prev, [name]: true }))
    }

    const handleRegistration = async (e) => {
        e.preventDefault() // Prevent page reload when submitting the form
        // Mark every field as touched so all errors are displayed on submit
        setTouched({
          username: true,
          email: true,
          dateOfBirth: true,
          password: true,
          admin: true,
        })
        // Stop the submission if any field is invalid
        if (formInvalid) {
            console.warn('[WARN: RegistrationForm.js]: Registration form has invalid fields');
            return
        }
        console.log('[INFO: RegistrationForm.js]: Registering new user');// Log registration action for debugging
        setSubmitting(true)
        try {
            const success = await addUser?.()//Call the addUser Function
            // Reset touched state after a successful registration so no errors show on the empty form
            if (success) {
                setTouched({
                  username: false,
                  email: false,
                  dateOfBirth: false,
                  password: false,
                  admin: false,
                })
            }
        } finally {
            setSubmitting(false)
        }
    }

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

  const clearForm = () => {
    const confirmClear = window.confirm(// Ask the user to confirm before clearing all input fields
            "Are you sure you want to clear the form?"
        );
        if (!confirmClear) return;// Stop if the user clicks Cancel
        setNewUserData({
          username: '',
          email: '',
          dateOfBirth: '',
          password: '',
          admin: false,
        })
        setTouched({
          username: false,
          email: false,
          dateOfBirth: false,
          password: false,
          admin: false,
        })
  }

  // Minimum age: depends on whether the user registers as admin.
    //  18 for admin, 16 for regular user
    const minAge = newUserData.admin === true ? 18 : 16;
     // Latest acceptable date of birth for the minimum age requirement
    const today = new Date(); // Get today's date
    // Calculate the latest acceptable date of birth.
    // Example: If the minimum age is 18, the user's DOB must be on or before today's date minus 18 years.
    const maxDob = new Date(
        today.getFullYear() - minAge,
        today.getMonth(),
        today.getDate()
    )
        .toISOString()
        .split('T')[0];
    //========== EMPTY FIELD VALIDATION ====================
    const usernameEmpty = useMemo(
      () => !String(newUserData.username || '').trim(), [newUserData.username]
    )
     const emailEmpty = useMemo(
        () => !String(newUserData.email || '').trim(),[newUserData.email]
    );
    // Checks if a non-empty email is in a valid format
    const emailInvalid = useMemo(
        () => !emailEmpty && !emailRegex.test(String(newUserData.email).trim()),[newUserData.email, emailEmpty]
    );
    //========== AGE VALIDATION ====================
    // Checks whether the selected date of birth makes the user too young
    const dateOfBirthTooYoung = useMemo(() => {
        if (!newUserData.dateOfBirth) return false;// If no date of birth was selected, do not check age yet
        const dob = new Date(newUserData.dateOfBirth);// Convert the selected date of birth into a Date object
        const now = new Date();// Get the current date
        let age = now.getFullYear() - dob.getFullYear();// Calculate age based on year difference
        const m = now.getMonth() - dob.getMonth();// Calculate month difference
        // If the user's birthday has not happened yet this year,
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
            age--;// subtract 1 from the calculated age
        }
        return age < minAge;// Return true if the user is younger than the required minimum age
    }, [newUserData.dateOfBirth, minAge]);
    // Checks if date of birth is empty
    const dateOfBirthEmpty = useMemo(
        () => !String(newUserData.dateOfBirth || '').trim(),[newUserData.dateOfBirth]
    );
     // Checks if password is empty
    const passwordEmpty = useMemo(
        () => !String(newUserData.password || '').trim(),[newUserData.password]
    );
    // Checks if a non-empty password is too weak (8+ characters, 1 number and 1 special character)
    const passwordWeak = useMemo(
        () => !passwordEmpty && !passwordRegex.test(newUserData.password),[newUserData.password, passwordEmpty]
    );

    // True if any field would be rejected by the server
    const formInvalid =
        usernameEmpty || emailEmpty || emailInvalid ||
        dateOfBirthEmpty || dateOfBirthTooYoung ||
        passwordEmpty || passwordWeak;

    // Only show validation errors AFTER field was touched
    // Show username error only if the username field was touched and is empty
    const showUsernameError = touched.username && usernameEmpty;
// Show email error only if the email field was touched and is empty
    const showEmailError = touched.email && emailEmpty;
    // Show email format error only if the email field was touched and is not a valid email
    const showEmailFormatError = touched.email && emailInvalid;
    // Show password error only if the password field was touched and is empty
    const showPasswordError = touched.password && passwordEmpty;
    // Show password strength error only if the password field was touched and is too weak
    const showPasswordWeakError = touched.password && passwordWeak;
    const showDateOfBirthError = touched.dateOfBirth && dateOfBirthEmpty;
    // Show age error only if date of birth was touched, is not empty, and user is too young
    const showDateOfBirthAgeError =
        touched.dateOfBirth && !dateOfBirthEmpty && dateOfBirthTooYoung;

    // ========= IDs USED BY aria-labelledby / aria-describedby =========
    const usernameErrorId = 'registrationUsernameError';// ID used for username error message
    const emailErrorId = 'registrationEmailError';// ID used for email error message
    const dateOfBirthErrorId = 'registrationDateOfBirthError';// ID used for date of birth required error
    const dateOfBirthAgeHintId = 'registrationDateOfBirthAgeHint';// ID used for date of birth age hint
    const dateOfBirthAgeErrorId = 'registrationDateOfBirthAgeError';// ID used for date of birth age error
    const passwordHelpId = 'registrationPasswordHelp';// ID used for password help text
    const passwordErrorId = 'registrationPasswordError';// ID used for password error message
    const passwordReqId = 'registrationPasswordReq';// ID used for password requirements text


    //===========JSX RENDERING=============
  return (
    <form id='registrationForm' method='POST' onSubmit={handleRegistration} aria-labelledby='formTitle'>
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
            <div id='regisGroup1' aria-describedby='regisGroup1Descrip'>
            {/* --------Screen Reader Heading----------- */}
                    <p className='visually-hidden' id='regisGroup1Descrip'>GENERAL USER DETAILS INPUT</p>
            {/* STACK 1: USERNAME */}
            <Stack direction="horizontal" gap={3} id='regisStack1'>
      <div className="p-2" id='regisUsernameBlock'>
        {/*  username*/}
        <div className='inputDiv'>
        <label className='regisLabel' htmlFor='regisUsername'>USERNAME:</label>
            <input
                type='text'
                id='regisUsername'
                className='input'
                placeholder='USERNAME'
                required
                autoComplete='username'
                name='username'
                value={newUserData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                // ARIA ATTRIBUTES:
                aria-label='Registration Username'
                aria-required='true'
                aria-invalid={showUsernameError ? 'true' : 'false'}
                aria-describedby={showUsernameError ? usernameErrorId : undefined}
            />
            <small><Asterisk color='#C22419' fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
        </div>
        <div>
        {showUsernameError && (
          <div id={usernameErrorId} role='alert'>
        <span className='formErrorSpan' aria-live='assertive' >
            <Bug color="#C22419" fontWeight={700} size={16} aria-hidden='true' focusable='false'/><p className='errorText'>Username is required</p>
        </span>
        </div>
        )}
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
                 autoComplete='email'
                name='email'     
                value={newUserData.email}
                inputMode='email'
                onChange={handleChange}
                onFocus={()=>  setEmailMsg (true) }
                onBlur={(e) => {
                    setEmailMsg(false)
                    handleBlur(e)
                }}
                // ARIA ATTRIBUTES:
                                    aria-label='Registration Email'
                                    aria-required='true'
                                    aria-invalid={(showEmailError || showEmailFormatError) ? 'true' : 'false'}
                                    aria-describedby={(showEmailError || showEmailFormatError) ? emailErrorId : undefined}
            />
            <small><Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
        </div>
          {/* REQUIRED / FORMAT MESSAGE */}
          {(showEmailError || showEmailFormatError) && (
            <div id={emailErrorId} role='alert'>
<span className='formErrorSpan' aria-live='assertive'>
        <Bug color="#C22419" fontWeight={700} size={16} aria-hidden='true' focusable='false'/>
        <p className='errorText'>{showEmailError ? 'Email is required' : 'Please enter a valid email address'}</p>
        </span>
            </div>
          )}
        
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
        <label className='regisLabel' htmlFor='regisDateInput'>DATE OF BIRTH:</label>
            <input
                type='date'
                className='input'
                id='regisDateInput'
                required
                autoComplete='bday'
                name='dateOfBirth'
                value={newUserData.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                max={maxDob}

                // ARIA ATTRIBUTES:
                                    aria-label='Date of Birth Input'
                                    aria-required='true'
                                    aria-invalid={(showDateOfBirthError || showDateOfBirthAgeError) ? 'true' : 'false'}
                                    aria-describedby={
                                        showDateOfBirthError ? dateOfBirthErrorId
                                        : showDateOfBirthAgeError ? dateOfBirthAgeErrorId
                                        : dateOfBirthAgeHintId
                                    }

            />
            <Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' />
        </div>
  <div id='dateOfBirthErrorBlock'>
{showDateOfBirthError && (
    <div id={dateOfBirthErrorId} role='alert'>
     <span className='formErrorSpan'>
             <Bug color="#C22419" fontWeight={700} size={16} aria-hidden='true' focusable='false'/><p className='errorText'>Date of birth is required</p>
          </span>
    </div>
  )}
    {showDateOfBirthAgeError && (

      <div id={dateOfBirthAgeErrorId}  role="alert">
        <span className='formErrorSpan'>
            <Bug color="#C22419" fontWeight={700} size={16} aria-hidden='true' focusable='false'/>
            <p className='errorText'>
                                        You must be at least {minAge} years old to register{newUserData.admin === true ? ' as an admin' : ''}.
                                    </p>
        </span>
      </div>
                                  
                                )}
  </div>
      </div>
      <div className="p-2 ms-auto"></div>
      <div className="p-2" id={dateOfBirthAgeHintId} aria-live='polite'>
        <p className='reqText'>All users must be 16 years or older</p>
      </div>
    </Stack>    
            </div>
            {/* PASSWORD AND ADMIN */}
            <div id='regisGroup2' aria-describedby='group2Descrip'>
            <p className='visually-hidden' id='group2Descrip'>PASSWORD AND OPTIONAL ADMIN INPUT</p>
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
                autoComplete='new-password'
                placeholder='PASSWORD'
                name='password'
                value={newUserData.password}
                onChange={handleChange}
                onFocus={() => setPswdMsg(true)}
                onBlur={(e) => {
                    setPswdMsg(false)
                    handleBlur(e)
                }}
                // ARIA ATTRIBUTES:
                aria-label='password input'
                aria-required='true'
                aria-invalid={(showPasswordError || showPasswordWeakError) ? 'true' : 'false'}
                aria-describedby={[
                    (showPasswordError || showPasswordWeakError) ? passwordErrorId : null,
                    passwordReqId,
                    pswdmsg ? passwordHelpId : null,
                ]
                    .filter(Boolean)
                    .join(' ')}
            />
            <Button 
                id='showPasswordBtn' 
                variant='warning' 
                onClick={() => setShowPassword(!showPassword)}
                type='button'
                // ARIA ATTRIBUTES
                aria-label={showPassword ? 'Hide Password': 'Show password'}
                aria-pressed={showPassword}
                aria-expanded={showPassword}
                >
                {showPassword ? <Eye size={16} fontWeight={700} aria-hidden='true' focusable='false' /> 
                  : <EyeOff size={16} fontWeight={700}  aria-hidden='true' focusable='false' />}
            </Button>
            <Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' />
        </div>
        {(showPasswordError || showPasswordWeakError) && (
<div id={passwordErrorId} role='alert'>
  <span className='formErrorSpan'>
        <Bug color="#C22419" fontWeight={700} size={16} aria-hidden='true' focusable='false'/>
        <p className='errorText'>{showPasswordError ? 'Password is required' : 'Password does not meet the requirements'}</p>
        </span>
</div>
        )}

         <p className='reqText' id={passwordReqId}>Password must be at least 8 characters long and <br/>must contain at least 1 number and 1 special character</p>
      </div>
      
      <div className="p-2 ms-auto">
    </div>
      {pswdmsg && (
<div className="p-2" id={passwordHelpId} role='alert' aria-live='polite'>
  <p className='msgText'>We will never share your password</p>
</div>
      )}
      
    </Stack>
    {/* STACK 5: ADMIN REGISTRATION */}
    <Stack direction="horizontal" gap={3} id='regisStack5'>
      <div className="p-2" id='adminRegisBlock'>
      <div className='inputDiv'>
<label className='regisLabel' htmlFor='regisAdmin'>REGISTER AS ADMIN:</label>
        <input
            type='checkbox'
            id='regisAdmin'
            name='admin'
            checked={newUserData.admin}
            onChange={handleChange}
            // ARIA ATTRIBUTES:
            aria-label='Register as admin'
            aria-required='false'
        />
        {/* input info message */}
        <p className='infoText'>OPTIONAL</p>
      </div>
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
          onClick={clearForm}
          disabled={submitting}
          // ARIA ATTRIBUTES
          aria-label='clearForm button'>CLEAR FORM</Button>
      </div>
      <div className="vr" style={{ color: '#404040', opacity: .50, width: '2px' }} />
      <div className="p-2">
        <Button 
        variant='light' 
        type='submit' 
        id='regisBtn'
        disabled={submitting}// Prevent double submissions while the request is in progress
        // ARIA ATTRIBUTES:
        aria-label='register button'
        aria-busy={submitting}
        >{submitting ? 'REGISTERING...' : 'REGISTER'}</Button>
      </div>
    </Stack>
        </div>
    </form>
  )
}
