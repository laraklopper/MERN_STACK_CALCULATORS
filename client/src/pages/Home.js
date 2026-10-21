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
import AdminRegisForm from '../components/AdminRegisForm';

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
            <AdminRegisForm/>
          </div>
        </Col>
        <Col/>
      </Row>
        
      </section>
      <Footer logout={logout}/>
    </div>
  )
}
