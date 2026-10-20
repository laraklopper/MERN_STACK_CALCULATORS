import React, { useState } from 'react'
import '../css/componentCss/EditUser.css'
import '../css/componentCss/FormSetup.css'
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { Asterisk, EyeOff, Eye } from 'lucide-react';

export default function EditPasswordForm({currentUser}) {
    const [currentPassword, setCurrentPassword] = useState()
     const [newPassword, setNewPassword] = useState('')
    const [showCurrentPswd, setShowCurrentPswd] = useState(false)
    const [showNewPswd, setShowNewPswd] = useState(false)
    const [showPswdMsg, setShowPswdMsg] = useState(false)
    
  return (
    <form id='editPasswordForm' aria-labelledby='formHeading'>
        <div id='formHeadingBlock'>
            <h3 id='formHeading'>EDIT PASSWORD</h3>
        </div>
        <div>
            <div>
                <Stack  gap={3}>
                    <div className="p-2">
                            <span>
                            <label className='editPswdLabel'>CURRENT PASSWORD:</label>
                            <Asterisk size={12} color='#C22419' fontWeight={700} aria-hidden='true' focusable='false'/>

                            </span>
                            
                        <div id='inputDiv'>
                            <input
                                className='input'
                                placeholder='CURRENT PASSWORD'
                                required
                                name='currentPassword'
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                onFocus={() => setShowPswdMsg(true)}
                                onBlur={() => setShowPswdMsg(false)}
                            />
                            <Button>
 {showCurrentPswd ? (<EyeOff/>):(<Eye/>)}
                            </Button>
                           

                        </div>
                    </div>
                    {/* <div className="p-2">Second item</div> */}
                     {/* Message: only rendered while one of the password fields has focus */}
                    {showPswdMsg && (
                        <div className="p-2" aria-live='polite'>
                            <p className='msgText'>WE WILL NEVER SHARE YOUR PASSWORD</p>
                        </div>
                    )}
    </Stack>
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
