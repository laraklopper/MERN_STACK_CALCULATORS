import React from 'react'
import '../css/pagesCss/pageSetup.css'
import '../css/pagesCss/Home.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ShieldUser } from 'lucide-react';

const ADMIN_OPTIONS = ['YES', 'NO']
export default function Home({logout, currentUser}) {
  return (
    <div id='pageContainer'>
    <Header currentUser={currentUser} pageHeader={'HOME'}/>
      <section id='homeSec1'>

      </section>
      <section id='homeSec2'>
      <Row>
        <Col/>
        <Col xs={12} md={8}>
          <div id='adminFormPanal'>
          <form id='registerAdminForm'>
          <div id='adminInput'>
            <Stack direction="horizontal" gap={3} id='adminRegisStack'>
      <div className="p-2" id='adminRegisBlock'>
        <label id='adminLabel' htmlFor='regisAdmin'>
          REGISTER AS ADMIN:
        </label>
        <select
        id='regisAdmin'
        // name=''
        // value={}
        // onChange={}
        // ARIA ATTRIBUTES

        >
          <option value={''}>SELECT</option>
          <option>YES</option>
          <option>NO</option>
        </select>
      </div>
      <div className="p-2 ms-auto">
        
      </div>
      <div className="vr" />
      <div className="p-2">Third item</div>
    </Stack>
          </div>
        </form>

          </div>
        </Col>
        <Col/>
      </Row>
        
      </section>
      <Footer logout={logout}/>
    </div>
  )
}
