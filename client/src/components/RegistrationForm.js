// RegistrationForm.js
//IMPORT REQUIRED MODULES AND PACKAGES
import React, { useMemo, useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/FormSetup.css'
import '../css/componentCss/RegisterForm.css'
// IMPORT BOOTSTRAP COMPONENTS
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
//IMPORT ICONS FROM LUCIDE-REACT
import { Eye, EyeOff, Asterisk, Bug  } from 'lucide-react';

// Empty registration form (same nested shape as server/models/userSchema.js)
export const emptyUser = {
    username: '',
    fullName: {
        firstName: '',
        lastName: '',
    },
    contactDetails: {
        email: '',
        contactNumber: '',
    },
    dateOfBirth: '',
    password: '',
    admin: false,
}

/*---------------REGULAR EXPRESSIONS-------------------------
Same rules as the server (middleware.js checkPassword / userSchema.js)
so the user sees the error before the request is sent*/
const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// South African contact number format: +27 82 123 4567 or 082 123 4567
const contactNumberRegex = /^(\+27|0)\d{2}[ ]?\d{3}[ ]?\d{4}$/;

// Touched state for every input (keys match the input "name" attributes)
const untouched = {
    'username': false,
    'fullName.firstName': false,
    'fullName.lastName': false,
    'contactDetails.email': false,
    'contactDetails.contactNumber': false,
    'dateOfBirth': false,
    'password': false,
}
// Same keys as untouched, all set to true (used on submit)
const allTouched = Object.fromEntries(Object.keys(untouched).map((key) => [key, true]))

// Returns an error message for a name field (2-50 characters, same as userSchema.js)
const nameError = (value, label) => {
    const trimmed = String(value || '').trim()
    if (!trimmed) return `${label} is required`
    if (trimmed.length < 2) return `${label} must be at least 2 characters long`
    if (trimmed.length > 50) return `${label} cannot exceed 50 characters`
    return null
}

// RegistrationForm.js function component
export default function RegistrationForm(//Export the default RegistrationForm.js function component
    {//PROPS PASSED FROM PARENT COMPONENT(Registration.js)
        newUserData,
        setNewUserData,
        addUser
    }) {
    // ==========STATE VARIABLES==============
    //state to display password
    const [showPassword, setShowPassword] = useState(false)
    // State to controls whether the contact details helper message is displayed
    const [emailMsg, setEmailMsg] = useState(false)
    // State to controls whether the password helper message is displayed
    const [pswdmsg, setPswdMsg] = useState(false)
    // State to disable the register button while the request is in progress
    const [submitting, setSubmitting] = useState(false)
    const [touched, setTouched] = useState(untouched)

    // Mark a field as touched when it loses focus so its errors can be shown
    const handleBlur = (event) => {
        const { name } = event.target
        setTouched((prev) => ({ ...prev, [name]: true }))
    }

    const handleRegistration = async (e) => {
        e.preventDefault() // Prevent page reload when submitting the form
        // Mark every field as touched so all errors are displayed on submit
        setTouched(allTouched)
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
                setTouched(untouched)
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
        // Handle nested fields, e.g. name='fullName.firstName'
        const [parent, child] = name.split('.')
        setNewUserData((prev) => (
            child
                ? { ...prev, [parent]: { ...prev[parent], [child]: fieldValue } }
                : { ...prev, [name]: fieldValue }// Handle non nested fields
        ))
    }

    const clearForm = () => {
        const confirmClear = window.confirm(// Ask the user to confirm before clearing all input fields
            "Are you sure you want to clear the form?"
        );
        if (!confirmClear) return;// Stop if the user clicks Cancel
        setNewUserData(emptyUser)
        setTouched(untouched)
    }

    // Minimum age: depends on whether the user registers as admin.
    //  21 for admin, 16 for regular user
    const minAge = newUserData.admin === true ? 21 : 16;
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

    //========== FIELD VALIDATION ====================
    // Each value is an error message, or null if the field is valid
    const usernameError = useMemo(() => {
        const username = String(newUserData.username || '').trim()
        if (!username) return 'Username is required'
        if (username.length < 2) return 'Username must be at least 2 characters long'
        if (username.length > 50) return 'Username cannot exceed 50 characters'
        return null
    }, [newUserData.username])

    const firstNameError = useMemo(
        () => nameError(newUserData.fullName?.firstName, 'First name'), [newUserData.fullName?.firstName]
    )
    const lastNameError = useMemo(
        () => nameError(newUserData.fullName?.lastName, 'Last name'), [newUserData.fullName?.lastName]
    )

    const emailError = useMemo(() => {
        const email = String(newUserData.contactDetails?.email || '').trim()
        if (!email) return 'Email is required'
        if (!emailRegex.test(email)) return 'Please enter a valid email address'
        return null
    }, [newUserData.contactDetails?.email])

    const contactNumberError = useMemo(() => {
        const contactNumber = String(newUserData.contactDetails?.contactNumber || '').trim()
        if (!contactNumber) return 'Contact number is required'
        if (!contactNumberRegex.test(contactNumber)) return 'Enter a valid SA number, e.g. 082 123 4567'
        return null
    }, [newUserData.contactDetails?.contactNumber])

    //========== AGE VALIDATION ====================
    const dateOfBirthError = useMemo(() => {
        if (!newUserData.dateOfBirth) return 'Date of birth is required'
        const dob = new Date(newUserData.dateOfBirth);// Convert the selected date of birth into a Date object
        const now = new Date();// Get the current date
        let age = now.getFullYear() - dob.getFullYear();// Calculate age based on year difference
        const m = now.getMonth() - dob.getMonth();// Calculate month difference
        // If the user's birthday has not happened yet this year,
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
            age--;// subtract 1 from the calculated age
        }
        // Error if the user is younger than the required minimum age
        if (age < minAge) return `You must be at least ${minAge} years old to register.`
        return null
    }, [newUserData.dateOfBirth, minAge]);

    // Checks if the password is empty or too weak (8+ characters, 1 number and 1 special character)
    const passwordError = useMemo(() => {
        if (!String(newUserData.password || '').trim()) return 'Password is required'
        if (!passwordRegex.test(newUserData.password)) return 'Password does not meet the requirements'
        return null
    }, [newUserData.password])

    // True if any field would be rejected by the server
    const formInvalid = Boolean(
        usernameError || firstNameError || lastNameError ||
        emailError || contactNumberError ||
        dateOfBirthError || passwordError
    );

    // Only show validation errors AFTER field was touched
    const showUsernameError = touched['username'] && usernameError;
    const showFirstNameError = touched['fullName.firstName'] && firstNameError;
    const showLastNameError = touched['fullName.lastName'] && lastNameError;
    const showEmailError = touched['contactDetails.email'] && emailError;
    const showContactNumberError = touched['contactDetails.contactNumber'] && contactNumberError;
    const showDateOfBirthError = touched['dateOfBirth'] && dateOfBirthError;
    const showPasswordError = touched['password'] && passwordError;

    // ========= IDs USED BY aria-labelledby / aria-describedby =========
    const usernameErrorId = 'registrationUsernameError';// ID used for username error message
    const firstNameErrorId = 'registrationFirstNameError';// ID used for first name error message
    const lastNameErrorId = 'registrationLastNameError';// ID used for last name error message
    const emailErrorId = 'registrationEmailError';// ID used for email error message
    const contactNumberErrorId = 'registrationContactNumberError';// ID used for contact number error message
    const dateOfBirthErrorId = 'registrationDateOfBirthError';// ID used for date of birth error message
    const dateOfBirthAgeHintId = 'registrationDateOfBirthAgeHint';// ID used for date of birth age hint
    const passwordHelpId = 'registrationPasswordHelp';// ID used for password help text
    const passwordErrorId = 'registrationPasswordError';// ID used for password error message
    const passwordReqId = 'registrationPasswordReq';// ID used for password requirements text

    // Renders an error message under an input
    const renderError = (id, message) => (
        <div id={id} role='alert'>
            <span className='formErrorSpan' aria-live='assertive'>
                <Bug color="#C22419" fontWeight={700} size={16} aria-hidden='true' focusable='false'/>
                <p className='errorText'>{message}</p>
            </span>
        </div>
    )

    //===========JSX RENDERING=============
    return (
        <form id='registrationForm' method='POST' onSubmit={handleRegistration} aria-labelledby='formTitle' noValidate>
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
                {/*  GROUP 1: USERNAME + FULLNAME*/}
                <div id='regisGroup1' aria-describedby='regisGroup1Descrip'>
                    {/* --------Screen Reader Heading----------- */}
                    <p className='visually-hidden' id='regisGroup1Descrip'>GENERAL USER DETAILS INPUT</p>
                    {/* INPUT STACK 1: USERNAME + FULLNAME */}
                    <Stack  gap={3} id='regisStack1'>
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
                                {showUsernameError && renderError(usernameErrorId, usernameError)}
                            </div>
                        </div>
                        {/* FULL NAME */}
                        <div className="p-2" id='fullNameInputBlock'>
                        {/* FULLNAME: FIRSTNAME + LAST NAME */}
                            <div id='fullNameDiv'>
                                <label className='regisLabel'>FULL NAME:</label>
                                {/* FIRST NAME */}
                                <div className='fullNameInputDiv'>
                                    <div className='inputDiv'>
                                        <label className='regisLabel' htmlFor='firstNameRegis' hidden>FIRST NAME:</label>
                                        <input
                                            type='text'
                                            className='input'
                                            id='firstNameRegis'
                                            placeholder='FIRST NAME'
                                            required
                                            autoComplete='given-name'
                                            name='fullName.firstName'
                                            value={newUserData.fullName.firstName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            // ARIA ATTRIBUTES:
                                            aria-label='Registration First Name'
                                            aria-required='true'
                                            aria-invalid={showFirstNameError ? 'true' : 'false'}
                                            aria-describedby={showFirstNameError ? firstNameErrorId : undefined}
                                        />
                                        <small><Asterisk color='#C22419' fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
                                    </div>
                                    {/* REQUIRED / FORMAT MESSAGE */}
                                    <div>
                                        {showFirstNameError && renderError(firstNameErrorId, firstNameError)}
                                    </div>
                                </div>
                                {/* LAST NAME */}
                                <div className='fullNameInputDiv'>
                                    <div className='inputDiv'>
                                        <label className='regisLabel' htmlFor='lastNameRegis' hidden>LAST NAME:</label>
                                        <input
                                            type='text'
                                            className='input'
                                            id='lastNameRegis'
                                            placeholder='LAST NAME'
                                            required
                                            autoComplete='family-name'
                                            name='fullName.lastName'
                                            value={newUserData.fullName.lastName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            // ARIA ATTRIBUTES:
                                            aria-label='Registration Last Name'
                                            aria-required='true'
                                            aria-invalid={showLastNameError ? 'true' : 'false'}
                                            aria-describedby={showLastNameError ? lastNameErrorId : undefined}
                                        />
                                        <small><Asterisk color='#C22419' fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
                                    </div>
                                    {/* REQUIRED / FORMAT MESSAGE */}
                                    <div>
                                        {showLastNameError && renderError(lastNameErrorId, lastNameError)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-2"></div>
                    </Stack>
                </div>
                {/* GROUP 2 : CONTACT DETAILS  + DATE OF BIRTH*/}
                <div id='regisGroup2'>
                    {/*INPUT STACK 2: CONTACT DETAILS*/}
                    <Stack direction="horizontal" gap={3} id='regisStack2'>
                        <div className="p-2" id='contactRegisBlock'>
                            {/* CONTACT DETAILS */}
                            <div id='contactInputDiv'>
                                <label className='regisLabel'>CONTACT DETAILS:</label>
                                {/* EMAIL */}
                                <div className='contactDetailsinputDiv'>
                                    <div className='inputDiv'>
                                        <label className='regisLabel' htmlFor='regisEmailInput' hidden>EMAIL:</label>
                                        <input
                                            className='input'
                                            id='regisEmailInput'
                                            type='email'
                                            required
                                            placeholder='EMAIL'
                                            autoComplete='email'
                                            name='contactDetails.email'
                                            value={newUserData.contactDetails.email}
                                            inputMode='email'
                                            onChange={handleChange}
                                            onFocus={() => setEmailMsg(true)}
                                            onBlur={(e) => {
                                                setEmailMsg(false)
                                                handleBlur(e)
                                            }}
                                            // ARIA ATTRIBUTES:
                                            aria-label='Registration Email'
                                            aria-required='true'
                                            aria-invalid={showEmailError ? 'true' : 'false'}
                                            aria-describedby={showEmailError ? emailErrorId : undefined}
                                        />
                                        <small><Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
                                    </div>
                                    {/* REQUIRED / FORMAT MESSAGE */}
                                    <div>
                                        {showEmailError && renderError(emailErrorId, emailError)}
                                    </div>
                                </div>
                                {/* CONTACT NUMBER */}
                                <div className='contactDetailsinputDiv'>
                                    <div className='inputDiv'>
                                        <label className='regisLabel' htmlFor='regisContactNumber' hidden>CONTACT NUMBER:</label>
                                        <input
                                            type='tel'
                                            className='input'
                                            id='regisContactNumber'
                                            placeholder='CONTACT NUMBER'
                                            required
                                            autoComplete='tel'
                                            inputMode='tel'
                                            name='contactDetails.contactNumber'
                                            value={newUserData.contactDetails.contactNumber}
                                            onChange={handleChange}
                                            onFocus={() => setEmailMsg(true)}
                                            onBlur={(e) => {
                                                setEmailMsg(false)
                                                handleBlur(e)
                                            }}
                                            // ARIA ATTRIBUTES:
                                            aria-label='Registration Contact Number'
                                            aria-required='true'
                                            aria-invalid={showContactNumberError ? 'true' : 'false'}
                                            aria-describedby={showContactNumberError ? contactNumberErrorId : undefined}
                                        />
                                        <small><Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' /></small>
                                    </div>
                                    {/* REQUIRED / FORMAT MESSAGE */}
                                    <div>
                                        {showContactNumberError && renderError(contactNumberErrorId, contactNumberError)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-2 ms-auto"></div>
                        {emailMsg && (
                            <div className="p-2" aria-live='polite'>
                                <p className='msgText'>We will never share your contact details</p>
                            </div>
                        )}
                    </Stack>
                    {/* INPUT STACK 3: DATE OF BIRTH */}
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
                                    aria-invalid={showDateOfBirthError ? 'true' : 'false'}
                                    aria-describedby={showDateOfBirthError ? dateOfBirthErrorId : dateOfBirthAgeHintId}
                                />
                                <Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' />
                            </div>
                            <div id='dateOfBirthErrorBlock'>
                                {/* REQUIRED / AGE MESSAGE */}
                                {showDateOfBirthError && renderError(dateOfBirthErrorId, dateOfBirthError)}
                            </div>
                        </div>
                        <div className="p-2 ms-auto"></div>
                        <div className="p-2" id={dateOfBirthAgeHintId} aria-live='polite'>
                            <p className='reqText'>All users must be 16 years or older</p>
                        </div>
                    </Stack>
                </div>
                {/* INPUT GROUP 3: PASSWORD */}
                <div id='regisGroup3' aria-describedby='group3Descrip'>
                    <p className='visually-hidden' id='group3Descrip'>PASSWORD INPUT</p>
                    {/* INPUT STACK 4: PASSWORD */}
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
                                    aria-invalid={showPasswordError ? 'true' : 'false'}
                                    aria-describedby={[
                                        showPasswordError ? passwordErrorId : null,
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
                                >
                                    {showPassword ? <Eye size={16} fontWeight={700} aria-hidden='true' focusable='false' />
                                        : <EyeOff size={16} fontWeight={700}  aria-hidden='true' focusable='false' />}
                                </Button>
                                <Asterisk color="#C22419" fontWeight={700} size={12} aria-hidden='true' focusable='false' />
                            </div>
                            {showPasswordError && renderError(passwordErrorId, passwordError)}
                            <p className='reqText' id={passwordReqId}>Password must be at least 8 characters long and <br/>must contain at least 1 number and 1 special character</p>
                        </div>
                        <div className="p-2 ms-auto">
                        </div>
                        {pswdmsg && (
                            <div className="p-2" id={passwordHelpId} aria-live='polite'>
                                <p className='msgText'>We will never share your password</p>
                            </div>
                        )}
                    </Stack>
                </div>
            </div>
            {/* ====END OF INPUT============= */}
            <div id='regisGroup4'>
                <Stack direction="horizontal" gap={3} id='regisActionsStack'>
                    <div className="p-2" id='requiredInfo'>
                        <p className='infoText' aria-hidden='true'>
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
                            aria-label='clearForm button'
                        >
                            CLEAR FORM
                        </Button>
                    </div>
                    <div className="vr" style={{ color: '#404040', opacity: .50, width: '2px' }} />
                    <div className="p-2">
                        <Button
                            variant='light'
                            type='submit'
                            id='regisBtn'
                            disabled={submitting}// Prevent double submissions while the request is in progress
                            // ARIA ATTRIBUTES:
                            aria-label={submitting ? 'REGISTERING...' : 'REGISTER'}
                            aria-busy={submitting}
                        >
                            {submitting ? 'REGISTERING...' : 'REGISTER'}
                        </Button>
                    </div>
                </Stack>
            </div>
        </form>
    )
}
