// Profile.js
import React from 'react'
import '../css/pagesCss/pageSetup.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Profile({currentUser, logout}) {
  return (
    <div>
      <Header currentUser={currentUser}/>
      <section>

      </section>
      <Footer logout={logout}/>
    </div>
  )
}
