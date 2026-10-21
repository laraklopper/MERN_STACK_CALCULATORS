// App.js
import React, {useCallback, useEffect, useState} from 'react'
import './App.css';
import Container from 'react-bootstrap/Container';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Home from './pages/Home';
import { Bug, GlobeOff } from 'lucide-react';
import ProtectedUserRoute from './protectedRoutes/ProtectedUserRoute';
import ProtectedAdminRoute from './protectedRoutes/ProtectedAdminRoute'
import Profile from './pages/Profile';
import Calculators from './pages/Calculators';
import Tax from './pages/Tax';
import Converter from './pages/Converter';
import Users from './pages/Users';
import History from './pages/History';
export default function App() {
  const [userData, setUserData] = useState({
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
    rememberMe: false,
  }); // State to hold user data
  const [currentUser, setCurrentUser] = useState(null); // State to hold the currently logged-in user
  const [users, setUsers] = useState([]); // State to hold user data
  // State to track if the user is logged in (restored from localStorage so a page refresh keeps the session)
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem('loggedIn') === 'true' && !!localStorage.getItem('token')
  );
  const [error, setError] = useState(null); // State to hold error messages

  //=======NAVIGATE=======
  // Hook to navigate between different routes
  const navigate = useNavigate()
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
        // The session is invalid (e.g. expired token), so clear it and fall back to the login routes
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('loggedIn')
        setCurrentUser(null)
        setLoggedIn(false)
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

  const logout = useCallback(()=> {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('loggedIn')
    setLoggedIn(false)
    setCurrentUser(null)
    setUsers([])
    setUserData({
      username: '',
      email: '',
      dateOfBirth: '',
      password: '',
      isAdmin: false,
      rememberMe: false,
    })
    navigate('/')
  },[navigate])
  return (
    <>
      <Container id='appContainer' role='main'>
       <Row id='globalErrorRow'>
          <Col xs={0} md id='errorCol1'/>
          <Col xs={12} md={8} id='globalErrorCol' aria-live='polite'>
          {/* ---------GLOBAL ERROR DISPLAY------------- */}
            <div id='globalErrorBlock' role='alert' aria-atomic='true'>
              {error && 
              <p id='errorMessage'><Bug size={20} fontWeight={900} aria-hidden='true'/>{error}</p>
              }
            </div>
          </Col>
          <Col xs={0} md id='errorCol2'/>
        </Row>
      {/* While a logged-in user's details are still loading, show a loading message
      instead of letting the protected routes redirect away */}
      {loggedIn && !currentUser ? (
        <p id='loadingMessage' aria-live='polite'>Loading...</p>
      ) : (
      <Routes>
        {loggedIn ? (
          <>
            {/* ---------PROTECTED USER ROUTES (Header.js nav links)--------- */}
            {/* Route to / (home) page */}
            <Route path="/" element={
              <ProtectedUserRoute currentUser={currentUser}>
                <Home 
                  currentUser={currentUser} 
                  users={users} 
                  logout={logout} 
                  setError={setError}
                  />
              </ProtectedUserRoute>
            }/>
            {/* Route to /calculators page */}
            <Route path='/calculators' element={
              <ProtectedUserRoute currentUser={currentUser}>
                <Calculators currentUser={currentUser} logout={logout} setError={setError}/>
              </ProtectedUserRoute>
            }/>
            {/* route to /tax page */}
            <Route path='/tax' element={
              <ProtectedUserRoute currentUser={currentUser}>
                <Tax currentUser={currentUser} logout={logout}/>
              </ProtectedUserRoute>
            }/>
            {/* Route to /converter page */}
            <Route path='/converter' element={
              <ProtectedUserRoute currentUser={currentUser}>
                <Converter currentUser={currentUser} logout={logout}/>
              </ProtectedUserRoute>
            }/>
            {/* Route to /history page */}
            <Route path='/history' element={
              <ProtectedUserRoute currentUser={currentUser}>
                <History currentUser={currentUser} logout={logout}/>
              </ProtectedUserRoute>
            }/>
            {/* Route to /profile page */}
            <Route path='/profile' element={
              <ProtectedUserRoute currentUser={currentUser}>
                <Profile currentUser={currentUser} logout={logout}/>
              </ProtectedUserRoute>
            }/>
            {/* ---------PROTECTED ADMIN ROUTE--------- */}
            <Route path='/users' element={
              <ProtectedAdminRoute currentUser={currentUser}>
                <Users currentUser={currentUser} users={users} logout={logout}/>
              </ProtectedAdminRoute>
            }/>
          </>
        ) : (
          <>
            {/* ---------PUBLIC ROUTES (MainHeader.js nav links)--------- */}
            <Route path="/" element={
              <Login
                setCurrentUser={setCurrentUser}
                userData={userData}
                setUserData={setUserData}
                setLoggedIn={setLoggedIn}
                setError={setError}
              />
            }/>
            <Route path="/reg" element={<Registration setError={setError}/>}/>
            {/* Protected pages send logged-out users back to the login page */}
            {['/calculators', '/tax', '/converter', '/history', '/profile', '/users'].map((path) => (
              <Route key={path} path={path} element={<Navigate to='/' replace/>}/>
            ))}
          </>
        )}
        {/* FALL BACK ROUTE: Response 404 PAGE NOT FOUND */}
        <Route path='*' element={<span id='pageNotFound'>
<h2 id='pageNotFound-text'>404: Page Not Found </h2><GlobeOff fontSize={42} fontWeight={800} color='#470D09'/>
        </span>
        }/>
      </Routes>
      )}
      </Container>
    </>
  )
}
