// Interest.js
import React, { useCallback, useState } from 'react'
import '../css/pagesCss/pageSetup.css'
import '../css/pagesCss/CalculatorsPage.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import Header from '../components/Header'
import Footer from '../components/Footer'
import BasicCalculator from '../components/BasicCalculator'
import InterestCalculator from '../components/InterestCalculator';
import { toInterestPayload } from '../util/calculatorFunc';

/* Function to send the interest form to one of the /interest routes.
Shared by calculateInterest and saveInterest, which post the same body.
Returns the parsed response, or throws with the server's message. */
const postInterest = async (path, form) => {
  const token = localStorage.getItem('token')
  // Send a POST request to the /interest/<path> endpoint
  const response = await fetch(`http://localhost:3001/interest/${path}`, {
    method: 'POST',
    mode: 'cors',
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`// Attach the token in the Authorization header
    },
    body: JSON.stringify(toInterestPayload(form))
  })
  const data = await response.json().catch(() => ({}));// Safely parse the JSON response (avoid crash if server returns non-JSON)

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data
}

export default function Calculators({logout, currentUser, setError}) {
  const [showCalculator, setShowCalculator] = useState(false)
  const [showIntCalculator, setShowIntCalculator] = useState(false)

  //  Function to toggle general/number calculator
  const toggleCalculator = useCallback(() => {
    setShowCalculator(prev => !prev)
    setShowIntCalculator(false)
  },[])
  // Function to toggle interest calculator
  const toggleInterestCalculator = useCallback(() =>{
    setShowIntCalculator(prev => !prev)
    setShowCalculator(false)
  },[])

  /* Function to calculate (simple or compound) interest.
  Returns the result, or throws so InterestCalculator.js can show the message beside the form. */
  const calculateInterest = useCallback(async (form) => {
    try {
      const data = await postInterest('calculate', form)
      setError(null);// Clear any previous errors
      return data.result
    } catch (error) {
      console.error('[ERROR: Calculators.js, calculateInterest]: Error calculating interest:', error.message);//Log an error message in the console for debugging purposes
      throw error
    }
  },[setError])

  /* Function to save an interest calculation to the logged in user's history.
  Returns the server's response, or throws so InterestCalculator.js can show the message. */
  const saveInterest = useCallback(async (form) => {
    try {
      const data = await postInterest('save', form)
      setError(null);// Clear any previous errors
      return data
    } catch (error) {
      console.error('[ERROR: Calculators.js, saveInterest]: Error saving interest calculation:', error.message);//Log an error message in the console for debugging purposes
      throw error
    }
  },[setError])
  //===================JSX RENDERING============================
  return (
    <div id='pageContainer'>
      <Header pageHeader={' CALCULATOR'} currentUser={currentUser}/>
      <section id='calculatorsSec1'>
        <Row id='toggleCalculatorsRow'>
          <Col id='toggleCalcCol1'/>
          <Col xs={6} id='toggleCalcCol'>
            <Stack gap={2} className="col-md-5 mx-auto" id='toggleCalculatorsStack'>
              <Button
                variant="light"
                id='toggleBasicCalcBtn'
                type='button'
                onClick={toggleCalculator}>
                {showCalculator ? 'Hide Calculator' : 'Show Calculator'}
              </Button>
              <Button
                variant="light"
                id='toggleIntCalcBtn'
                type='button'
                onClick={toggleInterestCalculator}
              >
                {showIntCalculator ? 'Hide Interest Calculator': 'Show Interest Calculator'}
              </Button>
            </Stack>
          </Col>
          <Col id='toggleCalcCol2'/>
        </Row>
        <div id='calculatorsPanal'>
          {/* TOGGLE BASIC/GENERAL CALCULATOR: BasicCalculator.js */}
          {showCalculator && (
            <div id='generalCalcPanal'>
              <Row id='basicCalcRow'>
                <Col id='basicCalcCol1'/>
                <Col xs={6} id='basicCalcCol'>
                  <div id='generalCalcBlock'>
                    <BasicCalculator/>
                  </div>
                </Col>
                <Col id='basicCalcCol2'/>
              </Row>
            </div>
          )}
          {showIntCalculator && (
            <div id='InterstCalcPanal'>
              <Row id='interestCalcRow'>
                <Col id='interestCalcCol1' />
                <Col xs={12} md={8} id='interestCalcCol'>
                  <div id='interestCalculatorBlock'>
                    <InterestCalculator
                      calculateInterest={calculateInterest}
                      saveInterest={saveInterest}
                      currentUser={currentUser}
                    />
                  </div>
                </Col>
                <Col id='interestCalcCol2'/>
              </Row>
            </div>
          )}
        </div>
      </section>
      <Footer logout={logout}/>
    </div>
  )
}
