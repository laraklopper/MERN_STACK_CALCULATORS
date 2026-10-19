import React, { useCallback, useState } from 'react'
import '../css/pagesCss/pageSetup.css'
import '../css/pagesCss/Converter.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Header from '../components/Header'
import Footer from '../components/Footer'
import CurrencyConverterForm from '../components/CurrencyConverterForm';
import { EMPTY_CONVERT_FORM, FALLBACK_CURRENCIES } from '../util/currencyFunc';

// Base URL of the API the converter talks to
const API_BASE_URL = 'http://localhost:3001';

export default function Converter({currentUser, logout}) {
  const [form, setForm] = useState(EMPTY_CONVERT_FORM)// Stores the user's form inputs
    const [result, setResult] = useState(null);// Stores the conversion returned by the API
    const [loading, setLoading] = useState(false);// Indicates whether an API request is currently running
    const [error, setError] = useState('');// Stores any error messages shown to the user
    const [showCurrencies, setShowCurrencies] = useState(false)
    const [showCurrCalculations, setShowCurrCalculations] = useState(false)
 const [currencyOptions, setCurrencyOptions] = useState(FALLBACK_CURRENCIES)
    const submitConvert = useCallback(async () => {
      setError('')
      setResult(null)
      if (!form.amount || !form.from || !form.to) {
        setError('Fill in all fields')
        return;
      }
      setLoading()
      const token = localStorage.getItem('token');//Retrieve Jwt Token From LocalStorage
      if(!token) return
      try {
        const response = await fetch(`${API_BASE_URL}/api/convert?amount=${encodeURIComponent(form.amount)}&from=${encodeURIComponent(form.from)}&to=${encodeURIComponent(form.to)}`, {
          method: 'GET',
          mode:'cors',
          headers: {
            'Authorization':  `Bearer ${token}`
          }
        })

        const data = await response.json()

         if (!response.ok) {
           console.error(data.message || 'Conversion failed.');//Log an error message in the console for debugging purposes
            setError(data.message || 'Conversion failed.');// Set the error state to display the error in the UI
            return;
        }
        setResult(data)
      } catch (error) {
        console.error('Failed to convert. Please try again.');
        setError('Failed to convert. Please try again.')
      }finally{
        setLoading(false)
      }
    }, [setError, setLoading, form.amount, form.from, form.to])

    const saveConversion = useCallback(async (conversion) => {
      try {
        const token = localStorage.getItem('token');//Retrieve Jwt Token From LocalStorage
      const response = await fetch(`${API_BASE_URL}/api/save`,{
        method: 'POST',//HTTP request method
        mode: 'cors',//Enable Cross-Origin Resource Sharing
        headers: {
          'Content-Type': 'application/json',// Specify that we're sending JSON data in the request body
          'Authorization': `Bearer ${token}`,// Attach the token in the Authorization header
        },
        body: JSON.stringify({// Send the conversion's inputs in the request body as JSON
          amount: conversion.amount,
          from: conversion.from,
          to: conversion.to,
        })
      })
      const data = await response.json();//Parse the response as json

      //Conditional rendering to check the request succeeded
      if (!response.ok) {
        const message = data.message || 'Could not save the conversion. Please try again.';
        console.error('[ERROR: CurrencyConverter.js, saveConversion]', message);//Log an error message in the console for debugging purposes
        throw new Error(message);
      }

      alert('Conversion Successfully Saved')
      } catch (error) {
        setError('Error saving conversion')
        console.error('Error saving conversion');
        alert('Error saving conversion')
      }
    },[])
    //==============================
    return (
    <div id='pageContainer'>
        <Header pageHeader={'CURRENCY CONVERTER'} currentUser={currentUser}/>
        <section id='converterSec1'>
          <Row id='currencyConverterRow'>
        <Col id='converterCol1'/>
        <Col xs={6}  id='converterCol'>
          <div id='currencyConverterPanal'>
            <CurrencyConverterForm
              setError={setError}
              result={result}
              setResult={setResult}
              setForm={setForm}
              saveConversion={saveConversion}
              submitConvert={submitConvert}
              form={form}
              currencyOptions={currencyOptions}
              EMPTY_CONVERT_FORM={EMPTY_CONVERT_FORM}
            />
          </div>
        </Col>
        <Col id='converterCol2'/>
      </Row>

        </section>
        <Footer logout={logout}/>
    </div>
  )
}
