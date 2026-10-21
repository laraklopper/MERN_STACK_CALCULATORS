//Registration.js
//IMPORT REQUIRED MODULES AND PACKAGES
import React, { useCallback, useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/pagesCss/LoggedOut.css'
import '../css/pagesCss/pageSetup.css'
// IMPORT BOOTSTRAP COMPONENTS
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// IMPORT CUSTOM COMPONENTS
import MainHeader from '../components/MainHeader'
import RegistrationForm from '../components/RegistrationForm'
import { useNavigate } from 'react-router-dom';

// ======MAIN REGISTRATION COMPONENT========
export default function Registration(
  {//PROPS PASSED FROM PARENT COMPONENT(App.js)
    setError
  }
) {
 // ===============STATE VARIABLES===============================
  const [newUserData, setNewUserData] = useState({
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
    isAdmin: false,
    // rememberMe: false,
  })

  //======================NAVIGATION HOOK========================
  const navigate = useNavigate()// Hook to navigate between different Pages

  const addUser = useCallback (async () => {
    try {
      setError?.(null)
      const response = await fetch(`http://localhost:3001/auth/register`,{
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUserData.username,
          email: newUserData.email,
          dateOfBirth: newUserData.dateOfBirth,
          password: newUserData.password,
          admin: newUserData.admin
        })
      })

      const data = await response.json().catch(() => ({}))

      /* Conditional rendering to check if the response
       is not successful (status code is not in the range 200-299)*/
      if (response.ok) {
        setError?.(null);//Clear previous errors
        // Reset the form so the details are not kept in state after registering
        setNewUserData({ username: '', email: '', dateOfBirth: '', password: '', admin: false })
        alert('New User successfully added')//Notify the user of successful registration
        navigate('/');//Navigate back to Login Page after successful registration
        return true;// Tell the form the registration succeeded
      } else {
        const message = data.message || 'Registration failed.';
        setError?.(message);
        console.error(`[ERROR: Registration.js]: Registration failed: ${message}`);//Log an error message in the console for debugging purposes
        return false;// Tell the form the registration failed
      }

    } catch (error) {
      alert('Registration failed. Please try again.'); // Show an alert to the user indicating that registration failed
      setError?.(`Registration failed: ${error.message}`);// Set the error state to display the error in the UI
      console.error(`[ERROR: Registration.js]: Error adding new user: ${error.message}`);//Log an error message in the console for debugging purposes
      return false;
    }
  },[newUserData, setError, navigate])
 
  //======JSX RENDERING==============
  return (
    <div id='pageContainer'>
      <MainHeader pageHeading={'REGISTER'}/>
      <section id='registrationSection'>
        <Row id='regisRow1'>
        <Col id='regisCol'>
          <div id='regisFormPanal'>
            <RegistrationForm
              setNewUserData={setNewUserData}
              newUserData={newUserData}
              addUser={addUser}
            />
          </div>
        </Col>
      </Row>
      </section>
    </div>
  )
}
