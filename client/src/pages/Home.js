//Home.js
import React, { useCallback, useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/pagesCss/pageSetup.css'
import '../css/pagesCss/Home.css'
// IMPORT BOOTSTRAP COMPONENTS
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// IMPORT CUSTOM COMPONENTS
import Header from '../components/Header'
import Footer from '../components/Footer'
import AdminRegisForm from '../components/AdminRegisForm';

// Admin requirements (same as server/routes/authRoutes.js /setAdmin)
const ADMIN_MIN_AGE = 21;// Admin users must be 21 or older
const ADMIN_MIN_ACCOUNT_AGE_MS = 24 * 60 * 60 * 1000;// User for 1 day during development (3 months in production)

// Calculate a user's age in years from their date of birth
const calculateAge = (dateOfBirth) => {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;// Birthday has not happened yet this year
  }
  return age;
}

export default function Home({logout, currentUser, setCurrentUser, setError}) {
  // localStorage key so the form is not displayed again once the user exits it
  const dismissKey = `adminFormDismissed_${currentUser?._id}`
  // State to track if the user exited the admin registration form
  const [adminFormDismissed, setAdminFormDismissed] = useState(
    () => localStorage.getItem(dismissKey) === 'true'
  )

  /* display/render AdminRegisForm.js if user is not an admin user
  and matches the age requirement of 21 years
  and has been a user for 3 months (1 day during development) */
  const showAdminForm = Boolean(
    currentUser &&
    !currentUser.admin &&
    !adminFormDismissed &&
    currentUser.dateOfBirth &&
    calculateAge(currentUser.dateOfBirth) >= ADMIN_MIN_AGE &&
    currentUser.createdAt &&
    Date.now() - new Date(currentUser.createdAt).getTime() >= ADMIN_MIN_ACCOUNT_AGE_MS
  )

  // Function to hide the admin form permanently
  const exitAdminForm = useCallback(() => {
    localStorage.setItem(dismissKey, 'true')
    setAdminFormDismissed(true)
  },[dismissKey])

  const setAdmin = useCallback (async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/auth/setAdmin', {
        method: 'PATCH',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data?.message || 'Failed to register as admin');
      // Save the new token (contains the updated admin claim) and update the current user
      localStorage.setItem('token', data.token)
      setCurrentUser?.(data.user)
      setError(null)
      console.log('[SUCCESS: Home.js] User registered as admin');
    } catch (error) {
      console.error('[ERROR: Home.js] Error setting user as admin:', error.message);
      setError(`Error setting user as admin: ${error.message}`)
    }
  },[setCurrentUser, setError])

  //===================================================
  return (
    <div id='pageContainer'>
    <Header currentUser={currentUser} pageHeader={'HOME'}/>
      <section id='homeSec1'>
        <Row id='homeRow1'>
          <Col id='homeCol1'>

          </Col>
        </Row>
      </section>
      {/* SECTION 2: ADMIN REGISTRATION FORM */}
      {showAdminForm && (
      <section id='homeSec2'>
      <div id='adminFormDiv'>
 <Row id='adminFormRow'>
        <Col id='adminFormCol1'/>
        <Col xs={12} md={10} id='adminFormCol'>
          <div id='adminFormPanal'>
            <AdminRegisForm
              setAdmin={setAdmin}
              exitAdminForm={exitAdminForm}
            />
          </div>
        </Col>
        <Col id='adminFormCol2'/>
      </Row>
      </div>
      </section>
      )}
      <Footer logout={logout}/>
    </div>
  )
}
