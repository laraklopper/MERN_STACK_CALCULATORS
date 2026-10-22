import React from 'react'
import '../css/componentCss/Header.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import { NavLink } from 'react-router-dom';

export default function Header({ pageHeader, currentUser }) {
  return (
    <header className="header">
    {/* Header Row1 */}
      <Row id='headerRow1'>
        <Col></Col>
      </Row>
      {/* Header Row 2 */}
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
      {/* Header Row 3 */}
      <Row id='headerNavRow'>
        <Col/>
        <Col md={8}>
          <nav className="headerNav">
            <ul className="headerNavList">
              <Stack gap={3} id='navbarStack'>
                <div className="p-2" id='navbarBlock1'>
                    {/* Link to Home Page */}
                  {currentUser && (
                    <li className='linkItem'>
                      <NavLink className="navLink" to="/">HOME</NavLink>
                    </li>
                  )}
                  {/* Link to calculators page */}
                  {currentUser && (
                    <li className='linkItem'>
                      <NavLink className='navLink' to="/calculators">CALCULATORS</NavLink>
                    </li>
                  )}
                  {/* Link to Tax Calculators page */}
                  {currentUser && (
                    <li className='linkItem'>
                      <NavLink className={'navLink'} to="/tax">TAX CALCULATORS</NavLink>
                    </li>
                  )}
                </div>
                <div className="p-2" id='navbarBlock2'>
                {/* Link to Converter Page */}
                  {currentUser && (
                    <li className='linkItem'>
                      <NavLink className='navLink' to="/converter">CONVERTER</NavLink>
                    </li>
                  )}
                  {/* Link to Calculation History page */}
                  {currentUser && (
                    <li className='linkItem'>
                      <NavLink to={'/history'} className="navLink">CALCULATION HISTORY</NavLink>
                    </li>
                  )}
                  {/* Link to Profile page */}
                  {currentUser && (
                    <li className='linkItem'>
                      <NavLink to='/profile' className='navLink'>PROFILE</NavLink>
                    </li>
                  )}
                </div>
                {/* ADMIN ONLY ROUTES */}
                <div className="p-2" id='navbarBlock3'>
                  {currentUser?.admin && (              
                    <li className='linkItem'>
                      <NavLink to='/taxConfig' className='navLink'>TAX CONFIGURATION</NavLink>
                    </li>
                )}
                {/* Link to Users page (adminOnly) */}
                {currentUser?.admin && (
                    <li className='linkItem'>
                      <NavLink to='/users' className='navLink'>USERS</NavLink>
                    </li>
                )}
                </div>
                
              </Stack>
            </ul>
          </nav>
        </Col>
        <Col/>
      </Row>
    </header>
  )
}
