import React from 'react'
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
  return (
    <div id='pageContainer'>
      <Header currentUser={currentUser} pageHeader={'TAX CALCULATORS'}/>
      <section id='taxCalculatorsSec1'>
      <div id='toggleTaxClacPanal'>
    <Row id='toggleTaxCalcRow'>
        <Col id='toggleTaxCalcCol1'/>
        <Col xs={6} id='toggleTaxCalcCol'>
          <Stack gap={3} id='toggleTaxCalculatorStack'>
      <div className="p-2" id='toggleTaxCalc1Block'>
        <Button variant='light' id='toggleTaxCalcBtn'>SHOW (INCOME) TAX CALCULATOR</Button>
      </div>
      <div className="p-2" id='toggleTaxCalc2Block'>
        <Button variant='light' id='toggleProvCalcBtn'>SHOW PROVISIONAL TAX CALCULATOR</Button>
      </div>
      <div className="p-2" id='toggleTaxCalc3Block'>
        <Button variant='light' id='toggleVatCalcBtn'>SHOW VAT CALCULATOR</Button>
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
