import React from 'react'
import '../css/pagesCss/pageSetup.css'
import Stack from 'react-bootstrap/Stack';
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Home({logout, currentUser}) {
  return (
    <div id='pageContainer'>
    <Header currentUser={currentUser} pageHeader={'HOME'}/>
      <section>

      </section>
      <section id='homeSec2'>
        <form>
          <div>
            <Stack direction="horizontal" gap={3}>
      <div className="p-2">First item</div>
      <div className="p-2 ms-auto">Second item</div>
      <div className="vr" />
      <div className="p-2">Third item</div>
    </Stack>
          </div>
        </form>
      </section>
      <Footer logout={logout}/>
    </div>
  )
}
