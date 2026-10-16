import React from 'react'
import '../css/pagesCss/pageSetup.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Converter({currentUser, logout}) {
  return (
    <div id='pageContainer'>
        <Header pageHeader={'CURRENCY CONVERTER'} currentUser={currentUser}/>
        <section>

        </section>
        <Footer logout={logout}/>
    </div>
  )
}
