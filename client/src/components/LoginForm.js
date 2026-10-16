import React, {useMemo, useState} from 'react'
import '../css/componentCss/FormSetup.css'
import '../css/componentCss/LoginForm.css'
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import { Eye, EyeOff, Bug  } from 'lucide-react';
export default function LoginForm({userData, setUserData, submitLogin}) {
    const [showPassword, setShowPassword] = useState(false);
    const [usernameMsg, setUsernameMsg] = useState(false)
    const [pswdMsg, setPswdMsg] = useState(false);
    const [touched, setTouched] = useState({
        username: 'false',
        password: 'false'
    })

    //==================VALIDATION LOGIC========================
    // Checks if username is empty
    const usernameEmpty = useMemo( // Memorises the validation result until userData.username changes
        () => !String (userData.username || '').trim(),// Returns true if username is empty, missing, or only contains spaces
        [userData.username] // Recalculate only when the username value changes
    )

    // Checks if password is empty
    const passwordEmpty = useMemo(// Memorises the validation result until userData.password changes
        () => !String (userData.password || '').trim(),// Returns true if password is empty, missing, or only contains spaces
        [userData.password]// Recalculate only when the password value changes
    )

     // Only show validation errors AFTER field was touched
    const showUsernameError = touched.username && usernameEmpty;// Show username error only after field was touched
    const showPasswordError = touched.password && passwordEmpty;// Show password error only after field was touched
      //=================EVENT LISTENERS===================
    //Function to submit Login form
    const handleLogin = (e) => {
        e.preventDefault();//Prevent default form submission
        submitLogin();// Call the submitLogin function passed as a prop from the parent component (Login.js)
    }

  // ========= IDs USED BY aria-labelledby / aria-describedby =========
    // Keeps ARIA references stable and readable
    const formTitleId = 'loginFormTitle';
    const usernameHelpId = 'loginUsernameHelp';
    const passwordHelpId = 'loginPasswordHelp';
    // error IDs (for aria-describedby)
    const usernameErrorId = 'loginUsernameError';
    const passwordErrorId = 'loginPasswordError';

  return (
    <form id="loginForm" method="POST" onSubmit={handleLogin} aria-labelledby={formTitleId}>
          {/* ------------Screen Reader Title------------ */}
            <p className='visually-hidden' id={formTitleId}>LOGIN FORM</p>
    <div id="formHeadingBlock">
<h3 id="formHeading">SIGN IN</h3>
    </div>
    {/*======FORM INPUT==============*/}
        <div id="loginFormInput">
        {/* STACK 1 */}
                <Stack gap={3} id='loginStack1'>
      <div className="p-2" id="usernameInputBlock">
            <label className='loginLabel'>USERNAME:</label>
            <input 
            type="text" 
            className='input' 
            placeholder='USERNAME' 
            name='username' 
            value={userData.username} 
            onChange={(e) => setUserData({...userData, username: e.target.value})}
                    onFocus={() => setUsernameMsg(true)}
                            onBlur={() => {
                                setUsernameMsg(false)
                                setTouched((prev)=> ({...prev, username: true}))}}
                            // ARIA ATTRIBUTES:
                            aria-required="true"// Mark the field as required for assistive technologies
                            aria-label='Username'// Provide a label for screen readers (also have a visible label for sighted users)
                            aria-invalid={usernameEmpty ? 'true' : 'false'}// Mark invalid if empty (simple valid
            />
      </div>
                        {/* Username error message */}
                    {showUsernameError && (
                        <div className="p-2" id={usernameErrorId} aria-live='assertive'>
                            <p className='loginErrorMessage'><Bug size={16} fontWeight={900} aria-hidden='true' focusable='false'/>Username is required</p>
                        </div>
                    )}
                    {/* Username help message */}
                    {usernameMsg && (
                        <div className="p-2" id={usernameHelpId} aria-live='polite'>
                            <p className='loginHelpMessage'>Enter your username</p>
                        </div>
                    )}
    </Stack>
    {/* STACK 2 */}
    <Stack gap={3} id='loginStack2'>
       <div className="p-2" id="passwordInputBlock">
            <label className='loginLabel'>PASSWORD:</label>
            <div id="passwordInputContainer">
                <input
                    type={showPassword ? 'text' : 'password'}
                    className='input'
                    placeholder='PASSWORD'
                    name='password'
                    value={userData.password}
                    onChange={(e) => setUserData({...userData, password: e.target.value})}
                    onfocus={() => setPswdMsg(true)}
                    onblur={() => setPswdMsg(false)}
                    // ARIA ATTRIBUTES:
                            aria-label='password'// Provide a label for screen readers (also have a visible label for sighted users)
                            aria-required="true"// Mark the field as required for assistive technologies
                            aria-invalid={passwordEmpty ? 'true' : 'false'}// Mark invalid if empty (simple validation)
                            aria-describedby={[// Conditionally include help and error message IDs based on state
                                pswdMsg ? passwordHelpId : null,// Include help ID if help message is shown
                                passwordEmpty ? passwordErrorId : null,// Include error ID if password is empty (invalid)
                            ]
                                .filter(Boolean)// Filter out null values
                                .join(' ')}// Combine IDs into a space-separated string for aria-describedby
                            inputMode="text"// Helpful on mobile keyboards (password fields often still want text input mode for better keyboard options)
                />
                <Button 
                    variant='warning' 
                    id="showPasswordBtn" 
                    size="sm" 
                    onClick={() => setShowPassword(!showPassword)}
                    >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16}  />}
                </Button>
            </div>
      </div>
        {pswdMsg && (
            <div className="p-2" id={passwordHelpId}>
                <p className='msgText'>WE WILL NEVER SHARE<br/> YOUR PASSWORD.</p>
            </div>
        )}
                          {/* password error message */}
                    {showPasswordError && (
                        <div id={passwordErrorId} aria-live='assertive'>
                            <p className='loginErrorMessage'>
                                <Bug size={20} fontWeight={900} aria-hidden='true' focusable='false'/>Password is required</p>
                        </div>
                    )}

      <div className="p-2" id="rememberMeBlock">
            <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={userData.rememberMe}
                onChange={(e) => setUserData({...userData, rememberMe: e.target.checked})}
                // ARIA ATTRIBUTES
            />
            <label htmlFor="rememberMe" className='loginLabel'>
                REMEMBER ME
            </label>
      </div>
    </Stack>
        </div>
        {/* ----END OF INPUT-------- */}
        <div id="submitBtnBlock">
            <Button 
            variant='light' 
            type='submit'
            // aria-label=''
            >
                SIGN IN
            </Button>
      </div>
    </form>
  )
}
