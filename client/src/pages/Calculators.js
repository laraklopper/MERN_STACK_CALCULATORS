// Interest.js
import React, { useState } from 'react'
import '../css/pagesCss/pageSetup.css'
import '../css/pagesCss/CalculatorsPage.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Calculators({logout, currentUser}) {
  const [showCalculator, setShowCalculator] = useState(false)
  const [showIntCalculator, setShowIntCalculator] = useState(false)

  //===================JSX RENDERING============================
  return (
    <div id='pageContainer'>
        <Header pageHeader={' CALCULATOR'} currentUser={currentUser}/>
        <section id='calculatorsSec1'>
          <Row>
        <Col id='toggleCalcCol1'/>
        <Col xs={6}>
          <Stack gap={2} className="col-md-5 mx-auto" id='toggleCalculatorsStack'>
            <Button variant="light" id='toggleBasicCalcBtn'>
              SHOW CALCULATOR
            </Button>
            <Button variant="light" id='toggleIntCalcBtn'>
              SHOW INTEREST CALCULATOR
            </Button>
          </Stack>
        </Col>
        <Col id='toggleCalcCol2'/>
      </Row>
        </section>
        <Footer logout={logout}/>
    </div>
  )
}
