//Home.js
import React, { useCallback } from 'react'
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


export default function Home({logout, currentUser, setError}) {

 
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
        body: JSON.stringify()//payload
      })
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        
      }
    } catch (error) {
      setError('Error setting user as admin')
    }
  },[setError])

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
      <section id='homeSec2'>
      {/* display/render AdminRegisForm.js if user is not an admin user
      and matches the age requirement of 21 years 
      and has been a user for 3 months (1 day during developmet) */}
      <div id='adminFormDiv'>
 <Row id='adminFormRow'>
        <Col id='adminFormCol1'/>
        <Col xs={12} md={10} id='adminFormCol'>
          <div id='adminFormPanal'>
            <AdminRegisForm/>
          </div>
        </Col>
        <Col id='adminFormCol2'/>
      </Row>
      </div>
      </section>
      <Footer logout={logout}/>
    </div>
  )
}
