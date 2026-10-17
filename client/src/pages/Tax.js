import React, { useCallback, useState } from 'react'
import '../css/pagesCss/pageSetup.css'
import '../css/pagesCss/TaxCalculators.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import Header from '../components/Header'
import Footer from '../components/Footer'
/*Page to calculate ProvisionalTax,
IncomeTax & vat
*/
export default function Tax({currentUser, logout}) {
  const [showTaxCalc , setShowTaxCalc] = useState(false)
  const [showProvTaxCalc, setShowProvTaxCalc] = useState(false)
  const [showVatCalculator, setShowVatCalc] = useState(false)

  const toggleTaxCalculator = useCallback(() => {
    setShowTaxCalc(prev => !prev)
    setShowProvTaxCalc(false)
    setShowVatCalc(false)
  },[])
  const toggleProvTaxCalculator = useCallback(() => {
    setShowProvTaxCalc(prev => !prev)
    setShowTaxCalc(false)
    setShowVatCalc(false)
  },[])
  const toggleVatCalculator = useCallback(() => {
    setShowVatCalc(prev => !prev)
    setShowTaxCalc(false)
    setShowProvTaxCalc(false)
  },[])

  // ==========JSX RENDERING==========================
  return (
    <div id='pageContainer'>
      <Header currentUser={currentUser} pageHeader={'TAX CALCULATORS'}/>
      <section id='taxCalculatorsSec1'>
      <div id='toggleTaxClacPanal' role='region' aria-describedby='btnPanalDescrip'>
      {/* -------Screen Reader Description--------- */}
      <p className='visually-hidden' id='btnPanalDescrip'>
        Buttons to toggle tax calculators
      </p>
    <Row id='toggleTaxCalcRow'>
        <Col id='toggleTaxCalcCol1'/>
        <Col xs={6} id='toggleTaxCalcCol'>
          <Stack gap={3} id='toggleTaxCalculatorStack'>
      <div className="p-2" id='toggleTaxCalc1Block'>
        <Button 
          variant='light' id='toggleTaxCalcBtn' onClick={toggleTaxCalculator}>{showTaxCalc ? 'Hide (INCOME) TAX CALCULATOR':'SHOW (INCOME) TAX CALCULATOR'}</Button>
      </div>
      <div className="p-2" id='toggleTaxCalc2Block'>
        <Button variant='light' id='toggleProvCalcBtn' onClick={toggleProvTaxCalculator}>{showProvTaxCalc ? 'HIDE PROVISIONAL TAX CALCULATOR':'SHOW PROVISIONAL TAX CALCULATOR'}</Button>
      </div>
      <div className="p-2" id='toggleTaxCalc3Block'>
        <Button 
          variant='light' 
          id='toggleVatCalcBtn'
          type='button'
          onClick={toggleVatCalculator}
          // ARIA ATTTRIBUTES
          >{showVatCalculator ? 'Hide Vat Calculator': 'Show VAT calculator'}</Button>
      </div>
    </Stack>

        </Col>
        <Col id='toggleTaxCalcCol2'/>
      </Row>
      </div>
      <div>
        {/* CALCULATOR DISPLAY */}
      </div>
     
      </section>
      <Footer logout={logout}/>
    </div>
  )
}
