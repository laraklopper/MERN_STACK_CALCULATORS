import React from 'react'
import '../css/componentCss/ButtonGrid.css'
// IMPORT BOOTSTRAP COMPONENTS
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
// IMPORT ICONS FROM LUCIDE-REACT
import { Divide, 
        Equal, 
        Minus, 
        X, 
        Plus, 
        Delete
    } from 'lucide-react';

export default function ButtonGrid() {
  return (
    <div id='btnGrid' aria-labelledby='calculatorBtnGrid'>
 {/* ---------Screen Reader Heading----- */}
            <p className='visually-hidden' id='calculatorBtnGrid'>BUTTON GRID</p>
    </div>
  )
}
