import React, { useState } from 'react'
import '../css/pagesCss/pageSetup.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

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

        </section>
        <Footer logout={logout}/>
    </div>
  )
}
