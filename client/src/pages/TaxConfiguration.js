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
        <section>
             <Row>
        <Col>1 of 3</Col>
        <Col xs={5}>
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
        </Col>
        <Col>3 of 3</Col>
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
