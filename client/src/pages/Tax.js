import React from 'react'
import '../css/pagesCss/pageSetup.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
/*Page to calculate ProvisionalTax,
IncomeTax & vat
*/
export default function Tax({currentUser, logout}) {
  return (
    <div id='pageContainer'>
      <Header currentUser={currentUser} pageHeader={'TAX CALCULATORS'}/>
      <section>
        
      </section>
      <Footer logout={logout}/>
    </div>
  )
}
