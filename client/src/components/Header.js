import React from 'react'
import '../css/componentCss/Header.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import { NavLink } from 'react-router-dom';

export default function Header({ pageHeader, currentUser }) {
  return (
    <header className="header">
    <Row id='headerRow1'>
        <Col></Col>
    </Row>
    <Row id='headerRow2'>
        <Col id='headingCol1'/>
        <Col xs={5} id='headingCol'>
            <span id='headingPanal'>
 <h1 id="appTitle">CALCULATOR APP</h1>
      <h2 id='pageHeading'>{pageHeader}</h2>
            </span>
        </Col>
        <Col id='headingCol2'/>
      </Row>
    <Row>
    <Col md={12}>
        <nav className="headerNav">
            <ul className="headerNavList">
            <Stack gap={3}>
      <div className="p-2">First item</div>
      <div className="p-2">Second item</div>
      <div className="p-2">Third item</div>
    </Stack>
            {currentUser && (
                <li className='linkItem'>
                    <NavLink className="navLink" to="/">HOME</NavLink>
                </li>   
            )}
                
            </ul>
        </nav>
    </Col>
    </Row>
     

    </header>
  )
}
