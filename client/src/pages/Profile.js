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

export default function Profile({currentUser, logout}) {
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
      <div className="p-2" id='userProfileBlock1'>
        {/* USERNAME */}
        <span className='userDataSpan'>
          <p className='userDetailLabel'>USERNAME:</p>
          <p className='userDetailValue'>{orPlaceholder(currentUser.username)}</p>
        </span>
      </div>
      <div className="p-2" id='userProfileBlock2'>
        {/* DATE OF BIRTH */}
        <span className='userDataSpan'>
          <p className='userDetailLabel'>DATE OF BIRTH:</p>
          <p className='userDetailValue'>{toUserDate(currentUser.dateOfBirth)}</p>
        </span>
      </div>
    </Stack>
            </Col>
        <Col xs={6} id='profileDataCol2'>
          <Stack gap={3} id='profileStack2'>
      <div className="p-2" id='userProfileBlock3'>
        {/* EMAIL */}
        <span className='userDataSpan'>
          <p className='userDetailLabel'>EMAIL</p>
          <p className='userDetailValue' id='userEmail'>{orPlaceholder(currentUser.email)}</p>
        </span>
      </div>
      <div className="p-2" id='userProfileBlock4'>
        <span className='userDataSpan'>
          <p className='userDetailLabel'>IS ADMIN:</p>
          <p className='userDetailValue'>{currentUser.admin ? 'YES' : 'NO'}</p>
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
        <div>
          {showEditProfile && (
            <div id='editProfilePanal'>
              <Row id='editProfileRow'>
                <Col id='editProfileCol1'/>
                <Col id='editProfileCol' xs={6}>
                  <div id='editProfileBlco'>
                    <EditProfileForm/>
                  </div>
                </Col>
                <Col id='editProfileCol2'/>
              </Row>
            </div>
          )}
          {showEditPassword && (
            <div id='editPasswordPanal'>
             <Row>
                <Col>1 of 3</Col>
                <Col xs={6}>
                  <div>
                    <EditPasswordForm/>
                  </div>
                </Col>
                <Col>3 of 3</Col>
              </Row>
            </div>
          )}
        </div>
      </section>


      <Footer logout={logout}/>
    </div>
  )
}
