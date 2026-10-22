import React, { useState } from 'react'
import '../css/pagesCss/pageSetup.css'
import '../css/pagesCss/TaxConfig.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TaxYearForm from '../components/TaxYearForm';


export default function TaxConfiguration(
    {
        currentUser,
        logout
    }
) {
    const [showTaxYearForm, setShowTaxYearForm] = useState(false)

    const toggleAddTaxYear = () => setShowTaxYearForm((prev) => !prev)
  return (
    <div id='pageContainer'>
        <Header pageHeader={'TAX DATA CONFIGURATION'} currentUser={currentUser}/>
        <section id='taxConfigSection1'>
             <Row id='toggleTaxYearRow'>
        <Col id='toggleTaxYearCol1'/>
        <Col xs={5} id='toggleTaxYearCol'>
            <div id='toggleTaxYearDiv'>
              <Button
                variant='light'
                id='toggleTaxYearFormBtn'
                type='button'
                onClick={toggleAddTaxYear}
                // ARIA ATTRIBUTES:
                aria-label={showTaxYearForm ? 'Hide add tax year' : 'Add tax year'}
                aria-expanded={showTaxYearForm}
                aria-pressed={showTaxYearForm}
                aria-controls='taxYearFormPanal'
            >
                {showTaxYearForm ? 'Hide add tax year' : 'Add tax year'}
            </Button>

            </div>
          
        </Col>
        <Col id='toggleTaxYearCol2'/>
      </Row>
            {showTaxYearForm && (
                <div id='taxYearFormPanal'>
                    <Row id='taxYearFormRow'>
                        <Col id='taxYearFormCol1'/>
                        <Col id='taxYearFormCol1' xs={12} md={10}>
                            <div id='taxYearFormBlock'>
                                <TaxYearForm/>
                            </div>
                        </Col>
                        <Col id='taxYearFormCol2'/>
                    </Row>
                </div>
            )}

        </section>
        <Footer logout={logout}/>
    </div>
  )
}
