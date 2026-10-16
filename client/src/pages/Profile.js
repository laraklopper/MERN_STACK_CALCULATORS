// Profile.js
import React from 'react'
import '../css/pagesCss/pageSetup.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Profile({currentUser, logout}) {
  return (
    <div id='pageContainer'>
      <Header currentUser={currentUser} pageHeader={'PROFILE'}/>
      <section>

      </section>
      <Footer logout={logout}/>
    </div>
  )
}
