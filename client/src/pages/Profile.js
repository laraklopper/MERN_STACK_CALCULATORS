// Profile.js
import React, { useCallback, useState } from 'react'
import '../css/pagesCss/pageSetup.css'
import '../css/pagesCss/Profile.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import Header from '../components/Header'
import Footer from '../components/Footer'
import { orPlaceholder, toUserDate } from '../util/dateFunctions';
import EditProfileForm from '../components/EditProfileForm';
import EditPasswordForm from '../components/EditPasswordForm';

export default function Profile(
  {//PROPS PASSED FROM PARENT COMPONENT
    currentUser,
    setCurrentUser,
    logout,
    setError
  }) {
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)

  const toggleEditProfile = useCallback(() => {
    setShowEditProfile((prev) => (!prev))
    setShowEditPassword(false)
  },[])
  const toggleEditPassword = useCallback(() => {
    setShowEditPassword(prev => (!prev))
    setShowEditProfile(false)
  },[])

  // State to disable the delete admin button while the request is in progress
  const [clearingAdmin, setClearingAdmin] = useState(false)

  const changeStatus = useCallback(async () => {
    setClearingAdmin(true)
    try {
      // Send request to /auth/clearAdmin endpoint
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/auth/clearAdmin', {
        method: 'PATCH',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data?.message || 'Failed to remove admin status');
      // Save the new token (contains the updated admin claim) and update the current user
      localStorage.setItem('token', data.token)
      // Do not display AdminRegisForm.js (Home.js) again
      localStorage.setItem(`adminFormDismissed_${data.user?._id}`, 'true')
      setCurrentUser?.(data.user)
      setError?.(null)
      console.log('[SUCCESS: Profile.js] Admin status removed');
    } catch (error) {
      console.error('[ERROR: Profile.js] Error removing admin status:', error.message);
      setError?.(`Error removing admin status: ${error.message}`)
    } finally {
      setClearingAdmin(false)
    }
  },[setCurrentUser, setError])


// Function to confirm admin status removal
    const confirmAdminExit = () => {
        const confirmExit = window.confirm(
            'Are you sure you want to permanently exit admin status'
        )
        if (!confirmExit) return;
        changeStatus()
    }
  //=================
  return (
    <div id='pageContainer' role='main'>
      <Header currentUser={currentUser} pageHeader={'PROFILE'}/>
      <section id='profileSec1'>
        <div id='userProfile'>
          <Row id='profileRow1'>
            <Col id='profileHeadCol'>
            <Stack direction="horizontal" gap={3} id='profileHeaderStack'>
      <div className="p-2">
        {/* USERNAME */}
        <h2 id='profileHeading'>{orPlaceholder(currentUser.username)}</h2>
      </div>
      <div className="p-2 ms-auto"/>
      <div className="p-2"/>
    </Stack>
            </Col>
          </Row>
          <Row id='profileRow2'>
            <Col xs={6} id='profileDataCol1'>
              <Stack gap={3}id='profileStack1'>
              {/* USERNMAME */}
      <div className="p-2" id='userProfileBlock1'>
        {/* USERNAME */}
        <span className='userDataSpan'>
          <p className='userDetailLabel'>USERNAME:</p>
          <p className='userDetailValue'>{orPlaceholder(currentUser.username)}</p>
        </span>
      </div>
      {/* CONTACT DETAILS */}
      <div className="p-2" id='userProfileBlock2'>
      <div className='nestedUserData'>
        <p className='userNestedLabel'>CONTACT DETAILS:</p>
        <div className='userDataGroup'>
        <span className='nestedUserDataSpan'>
          <p className='userDetailLabel'>EMAIL</p>
          <p className='userDetailValue'>{orPlaceholder(currentUser.contactDetails?.email)}</p>
        </span>
         <span className='nestedUserDataSpan'>
          <p className='userDetailLabel'>CONTACT NUMBER:</p>
          <p className='userDetailValue'>{orPlaceholder(currentUser.contactDetails?.contactNumber)}</p>
        </span>
        </div>
      
        </div>
      </div>
      {/* ADMIN STATUS */}
         <div className="p-2" id='userProfileBlock3'>
          <span className='userDataSpan'>
            <p className='userDetailLabel'>IS ADMIN:</p>
            <p className='userDetailValue'>{currentUser.admin ? 'YES' : 'NO'}</p>
          </span>
        {/* Only admin users can remove their admin status */}
        {currentUser.admin && (
        <Button
        id='deleteAdminBtn'
        type='button'
        variant='danger'
        onClick={confirmAdminExit}
        disabled={clearingAdmin}
        // ARIA ATTRIBUTES
        aria-busy={clearingAdmin}
        >
          {clearingAdmin ? 'REMOVING...' : 'DELETE ADMIN STATUS'}
        </Button>
        )}
      </div>
    </Stack>
            </Col>
        <Col xs={6} id='profileDataCol2'>
          <Stack gap={3} id='profileStack2'>
          {/* FULL NAME */}
          <div className="p-2" id='userProfileBlock4'>
            <div className='nestedUserData'>
              <p className='userNestedLabel'>FULL NAME:</p>
              <div className='userDataGroup'>
              {/* FIRST NAME */}
               <span className='nestedUserDataSpan'>
               <p className='userDetailLabel'>FIRST NAME:</p>
                <p className='userDetailValue'>{orPlaceholder(currentUser.fullName?.firstName)}</p>
              </span>
              {/* LAST NAME */}
              <span className='nestedUserDataSpan'>
              <p className='userDetailLabel'>LAST NAME:</p>
                <p className='userDetailValue'>{orPlaceholder(currentUser.fullName?.lastName)}</p>
              </span>
              </div>
            </div>
          </div>
          <div className="p-2" id='userProfileBlock5'>
        {/* DATE OF BIRTH */}
        <span className='userDataSpan'>
          <p className='userDetailLabel'>DATE OF BIRTH:</p>
          <p className='userDetailValue'>{toUserDate(currentUser.dateOfBirth)}</p>
        </span>
      </div>
    </Stack>
        </Col>
          </Row>
          <Row id='profileRow3'>
            <Col id='profileFootCol'>
              <Stack direction="horizontal" gap={3} id='profileFootStack'>
      <div className="p-2"></div>
      <div className="p-2 ms-auto">
        <Button
        variant='light'
        type='button'
        id='toggleEditUserBtn'
        onClick={toggleEditProfile}
        // ARIA ATTRIBUTES:
        aria-label={showEditProfile ? 'Hide Edit Profile': 'Edit Profile'}
        aria-pressed={showEditProfile}
        aria-expanded={showEditProfile}
        aria-controls='editProfilePanal'
        >
          {showEditProfile ? 'Hide Edit Profile': 'Edit Profile'}
        </Button>
      </div>
      <div className="vr" />
      <div className="p-2">
        <Button
        variant='light'
        type='button'
        id='toggleEditPswdBtn'
        onClick={toggleEditPassword}
        // ARIA ATTRIBUTES:
        aria-label={showEditPassword ? 'Hide Edit Password' : 'Edit Password'}
        aria-pressed={showEditPassword}
        aria-expanded={showEditPassword}
        aria-controls='editPasswordPanal'
        >
          {showEditPassword ? 'Hide Edit Password' : 'Edit Password'}
        </Button>
      </div>
    </Stack>
            </Col>
          </Row>
        </div>
        <div id='editUserFormPanal'>
          {showEditProfile && (
            <div id='editProfilePanal'>
              <Row id='editProfileRow'>
                <Col id='editProfileCol1'/>
                <Col id='editProfileCol' xs={6}>
                  <div id='editProfileBlock'>
                    <EditProfileForm/>
                  </div>
                </Col>
                <Col id='editProfileCol2'/>
              </Row>
            </div>
          )}
          {showEditPassword && (
            <div id='editPasswordPanal'>
             <Row id='editPasswordRow'>
                <Col id='editPswdCol1'/>
                <Col xs={6} id='editPswdCol'>
                  <div id='editPswdBlock'>
                    <EditPasswordForm
                      currentUser={currentUser}
                    />
                  </div>
                </Col>
                <Col id='editPswdCol2'/>
              </Row>
            </div>
          )}
        </div>
      </section>


      <Footer logout={logout}/>
    </div>
  )
}
