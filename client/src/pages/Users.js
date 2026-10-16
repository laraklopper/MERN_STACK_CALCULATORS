// Users.js(admin only)
import React from 'react'
import '../css/pagesCss/pageSetup.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Users({logout, currentUser}) {
  return (
    <div id='pageContainer'>
        <Header currentUser={currentUser} pageHeader={'USERS'}/>
        <Footer logout={logout}/>
    </div>
  )
}
