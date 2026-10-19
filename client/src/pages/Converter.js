import React, { useState } from 'react'
import '../css/pagesCss/pageSetup.css'
import '../css/pagesCss/Converter.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Header from '../components/Header'
import Footer from '../components/Footer'
import CurrencyConverterForm from '../components/CurrencyConverterForm';

export default function Converter({currentUser, logout}) {
  const [form, setForm] = useState()// Stores the user's form inputs
    const [result, setResult] = useState(null);// Stores the conversion returned by the API
    const [loading, setLoading] = useState(false);// Indicates whether an API request is currently running
    // const [error, setError] = useState('');// Stores any error messages shown to the user
    const [showCurrencies, setShowCurrencies] = useState(false)
    const [showCurrCalculations, setShowCurrCalculations] = useState(false)

    return (
    <div id='pageContainer'>
        <Header pageHeader={'CURRENCY CONVERTER'} currentUser={currentUser}/>
        <section id='converterSec1'>
          <Row id='currencyConverterRow'>
        <Col id='converterCol1'/>
        <Col xs={6}  id='converterCol'>
          <div id='currencyConverterPanal'>
            <CurrencyConverterForm/>
          </div>
        </Col>
        <Col id='converterCol2'/>
      </Row>

        </section>
        <Footer logout={logout}/>
    </div>
  )
}
