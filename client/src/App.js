// App.js
import React, {useState} from 'react'
import './App.css';
import Container from 'react-bootstrap/Container';
import { Route, Routes } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Home from './pages/Home';
import { Bug } from 'lucide-react';
export default function App() {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    dateOfBirth: '',
    password: '',
    isAdmin: false,
    rememberMe: false,
  }); // State to hold user data
  const [currentUser, setCurrentUser] = useState(null); // State to hold the currently logged-in user
  // const [users, setUsers] = useState([]); // State to hold user data
  const [loggedIn, setLoggedIn] = useState(false); // State to track if the user is logged in
  const [error, setError] = useState(null); // State to hold error messages
  
  return (
    <>
      <Container id='appContainer'>
       <Row id='globalErrorRow'>
          <Col xs={0} md id='errorCol1'/>
          <Col xs={12} md={6} id='globalErrorCol' aria-live='polite'>
          {/* ---------GLOBAL EROR MA */}
            <div id='globalErrorBlock' role='alert' aria-atomic='true'>
              {error && 
              <p id='errorMessage'><Bug size={20} fontWeight={900} aria-hidden='true'/>{error}</p>
              }
            </div>
          </Col>
          <Col xs={0} md id='errorCol2'/>
        </Row>
      <Routes>
        {loggedIn ? (
          <>
            <Route path="/" element={<Home currentUser={currentUser} />} />
          </>
        ) : (
        <>
  <Route path="/" element={<Login 
  setCurrentUser={setCurrentUser}
  userData={userData} 
  setUserData={setUserData} setLoggedIn={setLoggedIn} setError={setError}
  />} />
            <Route path="/reg" element={<Registration
            setError={setError}
             />} />
        </>
          
      
        )}
      </Routes>
      </Container>
    </>
  )
}
