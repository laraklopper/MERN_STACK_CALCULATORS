// Footer.js
import React from 'react'
// IMPORT CSS STYLESHEETS
import '../css/componentCss/Footer.css'
// IMPORT ICONS FROM LUCIDE-REACT
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
// IMPORT ICONS FROM LUCIDE-REACT
import { LogOut } from 'lucide-react';

export default function Footer({logout}) {
  return (
    <footer id='footer'>
    <Row id='footerRow1'>
        <Col id='footerCol1'>
            <Stack direction="horizontal" gap={3} id='logoutStack'>
      <div className="p-2"></div>
      <div className="p-2 ms-auto"/>
      <div className="vr" />
      <div className="p-2">
        <Button
            variant='warning'
            onClick={logout}
            id='logoutBtn'
        >
            <LogOut size={16}/> LOGOUT
        </Button>
      </div>
    </Stack>

        </Col>
      </Row>
        <Row id='footerRow2'>
            <Col md={12}/>
        </Row>
         {/* Row 3: CopyRight Information */}
      <Row id='footerRow3'>
        <Col xs={0} md id='copyRightCol1'/>
        <Col xs={12} md={4} id='copyRightCol'>
          <div id='copyright-div'>
            <p id='copyrightText' aria-label='copy right details' aria-live='polite' >© 2026 Calculator App. All rights reserved.</p>
          </div>
        </Col>
        <Col xs={0} md id='copyRightCol2'/>
      </Row>
    </footer>
  )
}
