import React, { useCallback } from 'react'
import '../css/pagesCss/LoggedOut.css'
import '../css/pagesCss/pageSetup.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import LoginForm from '../components/LoginForm';
import MainHeader from '../components/MainHeader';
export default function Login(
    {
        userData, 
        setUserData, 
        setError,
        setCurrentUser,
        setLoggedIn
    }
    ) {

        //Function to submit login
        const submitLogin = useCallback(async () => {
           try {
            // const token = localStorage.getItem('token')
            const response = await fetch('http://localhost/3001/auth/login', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: userData.username,
                    password: userData.password
                })
            })
            const data = await response.json().catch(() => ({}));// Safely parse JSON (avoid crash if server returns non-JSON)
      /* Conditional rendering to check if the response
       is not successful (status code is not in the range 200-299)*/
      if (response.ok) {
        localStorage.setItem('username', userData.username);// Store the user's username in the localStorage under the key 'username'
        localStorage.setItem('loggedIn', true); /* Store the login status of the user in the localStorage
        under the key 'loggedIn' Setting it to true if the user is logged in*/
        localStorage.setItem('token', data.token);/* Store the authentication token received
        from the server in the localStorage under the key 'token'*/
        setLoggedIn(true);//Set the setLoggedIn State to true
        setCurrentUser({ userId: data.userId, fullName: data.fullName, isAdmin: data.isAdmin });
        setError(null);//Clear any previous error messages
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
           
           } catch (error) {
            setError('')
           } 
        },[userData, setLoggedIn, setError, setCurrentUser])

        //============JSX RENDERING============
  return (
    <div id="pageContainer">
    <MainHeader pageHeading="LOGIN"/>
        <section id="loginSection">
            <div id="loginFormBlock">
             <Row id="loginFormRow">
                <Col id="loginFormCol1"/>
                <Col xs={6} id="loginFormCol2">
                    <div id="loginFormPanal">
                        <LoginForm 
                        submitLogin={submitLogin} 
                        userData={userData} 
                        setUserData={setUserData}
                        />
                    </div>
                </Col>
                <Col id="loginFormCol3"/>
                </Row>
            </div>
        </section>
    </div>
  )
}
