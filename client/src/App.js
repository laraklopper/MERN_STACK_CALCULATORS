// App.js
import React, {useEffect, useState} from 'react'
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
  const [users, setUsers] = useState([]); // State to hold user data
  const [loggedIn, setLoggedIn] = useState(false); // State to track if the user is logged in
  const [error, setError] = useState(null); // State to hold error messages
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!loggedIn) return;
        const token = localStorage.getItem('token')

        const response = await fetch('http://localhost:3001/users/fetchUsers',{
          method: 'GET',
          mode: 'cors',
          headers: { 
            'Content-Type': 'application/json',// Specify the content type as JSON
            'Authorization': `Bearer ${token}`//Attatch the token in the Authorization header
          },
        })
        const fetchedUsers = await response.json().catch(() => ({}));//Parse the JSON data from the Response body
        if (!response.ok) throw new Error(fetchedUsers?.message || fetchedUsers?.error || 'Failed to fetch users');
        //Conditional rendering to ensure the data is an array
        if (Array.isArray(fetchedUsers)) {
          setUsers(fetchedUsers);//Update the setUsers state with the usersList
          setError(null);// Clear any previous errors
          console.log(`[SUCCESS: App.js] Fetched ${fetchedUsers.length} users`);
        } else {
          throw new Error('Invalid data format received from server');//Throw an error message if the data format is invalid
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);//Log an error message in the console for debugging purposes
        setError(`Error fetching user data: ${error.message}`);// Set the error state to display the error in the UI
      }
    }
    const fetchCurrentUser = async () => {
      try {
         const token = localStorage.getItem('token');// Retrieve the JWT token from localStorage
        if (!token || !loggedIn) return;// If no token is found, exit the function
        const response = await fetch('http://localhost:3001/users/me',{
           method: 'GET',//HTTP request method
          mode: 'cors',//Enable Cross-Origin Resource Sharing 
          headers: { 
            'Content-Type': 'application/json',// Specify the Content-Type being sent in the request payload.
            'Authorization': `Bearer ${token}` // Attach the token in the Authorization header  
          },
        })

        const fetchedUser = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(fetchedUser?.message || fetchedUser?.error || 'Failed to fetch current user');
        if (fetchedUser && typeof fetchedUser === 'object' && !fetchedUser.error) {
          setCurrentUser(fetchedUser);
          setError(null);// Clear any previous errors
          console.log('[SUCCESS: App.js] Fetched current user data');
        } else {
          throw new Error('Invalid data format received from server');//Throw an error message if the data format is invalid
        }

      } catch (error) {
        console.error('Error fetching current user data:', error.message);//Log an error message in the console for debugging purposes
        setError(`Error fetching current user data: ${error.message}`);// Set the error state to display the error in the UI
      }
    }
     //Conditional rendering to check if the user is logged in before fetching data
    if (loggedIn) {
      /* Call the FetchUsers function to 
      fetch the list of users*/
      fetchCurrentUser();
      /*Call the FetchCurrentUser function to fetch the 
      current user's details*/
      fetchUsers();
    }
  },[loggedIn, setError])
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
            <Route path="/" element={<Home currentUser={currentUser} users={users} />} />
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
