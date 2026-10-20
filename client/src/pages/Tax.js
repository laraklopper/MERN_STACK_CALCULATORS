//Tax.js
//IMPORT REQUIRED MODULES AND PACKAGES
import React, { useCallback, useState } from 'react'
// IMPORT CSS STYLESHEETS
import '../css/pagesCss/pageSetup.css'
import '../css/pagesCss/TaxCalculators.css'
// IMPORT BOOTSTRAP COMPONENTS
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
// IMPORT CUSTOM COMPONENTS
import Header from '../components/Header'
import Footer from '../components/Footer'
import IncomeTaxCalculator from '../components/IncomeTaxCalculator';
import ProvisionalTaxCalculator from '../components/ProvisionalTaxCalculator';
import VatCalculator from '../components/VatCalculator';
import { taxSeedData } from '../util/taxSeedData';
/*Page to calculate ProvisionalTax,
IncomeTax & vat
*/
// =========MAIN TAX COMPONENT=============
export default function Tax({currentUser, logout, setError}) {
  const [showTaxCalc , setShowTaxCalc] = useState(false)
  const [showProvTaxCalc, setShowProvTaxCalc] = useState(false)
  const [showVatCalculator, setShowVatCalc] = useState(false)
const [taxYears, setTaxYears] = useState([taxSeedData.taxYear])
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
          variant='light' 
          id='toggleTaxCalcBtn' 
          type='button'
          onClick={toggleTaxCalculator}
          // ARIA ATTRIBUTES:
          aria-label={showTaxCalc ? 'Hide (INCOME) TAX CALCULATOR':'SHOW (INCOME) TAX CALCULATOR'}
          aria-pressed={showTaxCalc}
          aria-expanded={showTaxCalc}
          aria-controls='taxCalcPanal'
          >
          {showTaxCalc ? 'Hide (INCOME) TAX CALCULATOR':'SHOW (INCOME) TAX CALCULATOR'}</Button>
      </div>
      <div className="p-2" id='toggleTaxCalc2Block'>
        <Button 
          variant='light' 
          id='toggleProvCalcBtn' 
          onClick={toggleProvTaxCalculator}
          // ARIA ATTTRIBUTES:
          aria-label={showProvTaxCalc ? 'HIDE PROVISIONAL TAX CALCULATOR':'SHOW PROVISIONAL TAX CALCULATOR'}
          aria-pressed={showProvTaxCalc}
          aria-expanded={showProvTaxCalc}
          aria-controls='provTaxCalcPanal'
          >{showProvTaxCalc ? 'HIDE PROVISIONAL TAX CALCULATOR':'SHOW PROVISIONAL TAX CALCULATOR'}</Button>
      </div>
      <div className="p-2" id='toggleTaxCalc3Block'>
        <Button 
          variant='light' 
          id='toggleVatCalcBtn'
          type='button'
          onClick={toggleVatCalculator}
          // ARIA ATTTRIBUTES
          aria-label={showVatCalculator ? 'Hide Vat Calculator': 'Show VAT calculator'}
          aria-pressed={showVatCalculator}
          aria-expanded={showVatCalculator}
          aria-controls='vatCalculatorPanal'
          >
            {showVatCalculator ? 'Hide Vat Calculator': 'Show VAT calculator'}
          </Button>
      </div>
    </Stack>
        </Col>
        <Col id='toggleTaxCalcCol2'/>
      </Row>
      </div>
      {/* TAX CALCULATORS DISPLAY */}
      <div id='taxCalculatorDisplay'>
        {/* TOGGLE (INCOME) TAX CALCULATOR */}
        {showTaxCalc && (
          <div id='taxCalcPanal'>
            <Row id='incTaxCalcRow'>
            <Col id='incTaxCalcCol1'/>
              <Col id='incTaxCalcCol' xs={12} md={8}>
                <div id='incomeTaxCalcBlock'>
                  <IncomeTaxCalculator
                    currentUser={currentUser}
                    taxYears={taxYears}
                  />
                </div>
              </Col>
              <Col id='incTaxCalcCol2'/>
            </Row>
          </div>
        )}
        {/* TOGGLE PROVISIONAL TAX CALCULATOR */}
        {showProvTaxCalc &&(
          <div id='provTaxCalcPanal'>
            <Row id='provTaxCalcRow'>
              <Col id='provTaxCalcCol1'/>
              <Col id='provTaxCalcCol' xs={12} md={8}>
                <div id='provTaxCalcBlock'>
                  <ProvisionalTaxCalculator
                    currentUser={currentUser}
                    taxYears={taxYears}
                  />
                </div>
              </Col>
              <Col id='provTaxCalcCol2'/>
            </Row>
          </div>
        )}
        {/* TOGGLE VAT CALCULATOR */}
        {showVatCalculator && (
          <div id='vatCalculatorPanal'>
            <Row id='vatCalculatorRow'>
              <Col id='vatCalcCol1'/>
              <Col id='vatCalculatorCol' xs={12} md={8}>
                <div id='vatCalculatorBlock'>
                  <VatCalculator
                    currentUser={currentUser}
                  />
                </div>
              </Col>
              <Col id='vatCalcCol2'/>
            </Row>
          </div>
        )}
      </div>
      </section>
      <Footer logout={logout}/>
    </div>
  )
}
