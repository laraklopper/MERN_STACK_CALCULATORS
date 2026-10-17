import React from 'react'
import '../css/pagesCss/pageSetup.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function History({currentUser, logout}) {
  return (
    <div id='pageContainer'>
        <Header currentUser={currentUser}/>
        <Footer logout={logout}/>
    </div>
  )
}
