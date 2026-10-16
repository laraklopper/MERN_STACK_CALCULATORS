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
    <Col/>
    <Col xs={6}>
        <nav className="headerNav">
            <ul className="headerNavList">
            <Stack gap={3} id='navbarStack'>
      <div className="p-2">
        {currentUser && (
                <li className='linkItem'>
                    <NavLink className="navLink" to="/">HOME</NavLink>
                </li>   
            )}
            {currentUser && (
                <li className='linkItem'>
                    <NavLink className='navLink' to="/calculators">CALCULATORS</NavLink>
                </li>
            )}
             {currentUser && (
            <li className='linkItem'>
                <NavLink className={'navLink'} to="/tax">TAX CALCULATORS</NavLink>
            </li>
        )}

      </div>
      <div className="p-2">
       {currentUser && (
        <li className='linkItem'>
            <NavLink className='navLink' to="/converter">CONVERTER</NavLink>
        </li>
       )}
        {currentUser && (
                            <li className='linkItem'>
                                <NavLink to='/profile' className='navLink'>PROFILE</NavLink>
                            </li>
                        )}
                        {currentUser?.admin && (
                            <li>
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
