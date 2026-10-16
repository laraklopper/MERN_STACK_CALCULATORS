import React from 'react'
import '../css/pagesCss/pageSetup.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Home({logout, currentUser}) {
  return (
    <div id='pageContainer'>
    <Header currentUser={currentUser} pageHeader={'HOME'}/>
      <section>

      </section>
      <Footer logout={logout}/>
    </div>
  )
}
