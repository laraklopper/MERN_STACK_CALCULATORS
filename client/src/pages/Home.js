//Home.js
import React from 'react'
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


export default function Home({logout, currentUser}) {
  return (
    <div id='pageContainer'>
    <Header currentUser={currentUser} pageHeader={'HOME'}/>
      <section id='homeSec1'>

      </section>
      <section id='homeSec2'>
      <Row id='adminFormRow'>
        <Col id='adminFormCol1'/>
        <Col xs={12} md={10} id='adminFormCol'>
          <div id='adminFormPanal'>
            <AdminRegisForm/>
          </div>
        </Col>
        <Col id='adminFormCol2'/>
      </Row>
        
      </section>
      <Footer logout={logout}/>
    </div>
  )
}
