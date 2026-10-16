// Interest.js
import React from 'react'
import '../css/pagesCss/pageSetup.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Interest({logout, currentUser}) {
  return (
    <div>
        <Header pageHeader={'INTEREST CALCULATOR'} currentUser={currentUser}/>
        <Footer logout={logout}/>
    </div>
  )
}
