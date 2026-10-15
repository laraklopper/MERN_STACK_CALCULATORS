import React, { useState } from 'react'
import '../css/pagesCss/LoggedOut.css'
import '../css/pagesCss/pageSetup.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MainHeader from '../components/MainHeader'
import RegistrationForm from '../components/RegistrationForm'

export default function Registration(
  {setError}
) {
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    dateOfBirth: '',
    password: '',
    admin: false
  })
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
            />
          </div>
        </Col>
      </Row>
      </section>
    </div>
  )
}
