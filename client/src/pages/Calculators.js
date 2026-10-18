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
export default function Calculators({logout, currentUser, setError}) {
  const [showCalculator, setShowCalculator] = useState(false)
  const [showIntCalculator, setShowIntCalculator] = useState(false)
  const [interestData, setInterestData]

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

  // Function to calculate(simple or compound) interest
  const calculateInterest = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      // Send a POST request to /interest/calculate endpoint
      const response = await fetch(`http://localhost:3001/interest/calculate`, {
        method: 'POST',
        mode: 'cors',
        headers:{
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`// Attach the token in the Authorization header
        },
        body: JSON.stringify({

        })

        
      })
      const data = await response.json().catch(() => ({}));// Safely parse the JSON response (avoid crash if server returns non-JSON)

      if (!response.ok) {
        console.error(`[ERROR: Calculators.js, calculateInterest]`, data.message );//Log an error message in the console for debugging purposes
        throw new Error(data.message);
        
      }
    } catch (error) {
      console.error('[ERROR: Calculators.js, calculateInterest]: Error calcuting Interest:', error.message);//Log an error message in the console for debugging purposes
        setError(`Error calcuting Interest:: ${error.message}`);// Set the error state to display the error in the UI
    }
  },[setError])
  
  // Function to save interest calculation
  const saveInterest = useCallback(async () => {
    try {
      
    } catch (error) {
      
    }
  },[])
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
              <Col />
            <Col xs={12} md={8}>
          <div id='interestCalculatorBlock'>
            <InterestCalculator
              calculateInterest={calculateInterest}
              saveInterest={saveInterest}
            />
          </div>
        </Col>
        <Col/>
          </Row>
        
          </div>
        )}

      </div>
        </section>
        <Footer logout={logout}/>
    </div>
  )
}
