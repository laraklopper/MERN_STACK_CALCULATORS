# STYLING PACKAGES

## TABLE OF CONTENTS

1. [BOOTSTRAP](#1-bootstrap)
    - [1.1. BOOTSTRAP INSTALLATION](#11-bootstrap-installation)
    - [1.2. SETUP](#12-setup)
    - [1.3. BOOTSTRAP STYLES](#13-bootstrap-styles)
        - [1.3.1. BOOTSTRAP COLOURS](#131-bootstrap-colours)
        - [1.3.2. BOOTSTRAP BREAKPOINTS](#132-bootstrap-breakpoints)
2. [LUCIDE REACT](#2-lucide-react)
    - [2.1. LUCIDE REACT INSTALLATION](#11-installation)
    - [2.2. USAGE/SETUP](#22-usagesetup)
<!-- BOOTSTRAP -->

## 1. BOOTSTRAP

### 1.1. BOOTSTRAP INSTALLATION

In the CLI(terminal)

```bash
npm install react-bootstrap bootstrap
```

### 1.2. SETUP

[`client/src/index.js`](/client/src/index.js)

```js
import 'bootstrap/dist/css/bootstrap.min.css';
```
### 1.3. BOOTSTRAP STYLES
#### 1.3.1. BOOTSTRAP COLOURS

```css
<!-- /* VARIANTS */ -->
    --bs-primary: #0d6efd;
    --bs-secondary: #6c757d;
    --bs-success: #198754;
    --bs-info: #0dcaf0;
    --bs-warning: #ffc107;
    --bs-danger: #dc3545;
    --bs-light: #f8f9fa;
    --bs-dark: #212529;
```
*Primary*
```
#0D6EFD
#073A87
#05295E
#094CB0
#0B5DD9
```
*Secondary*
```
#6C757D
#B6C6D4
#93A0AB
#D9ECFC
#4D5359
```
*Success*
```css
#198754
#2ADE8A
#22B571
#0B3B24
#13633E
```
*Info*
```css
#0DCAF0
#06677A
#044552
#0889A3
#0AACCC
```
*Warning*
```css
#FFC107
#8A6804
#614903
#B38705
#DBA607
```
*Danger*
```css
#dc3545
#661820
#3D0F13
#8F222D
#B82C3A
```
*Light*
```css
#f8f9fa
#ACADAD
#D4D5D6
#838485
#5B5B5C
```
*Dark*
```css
#212529
#667380
#454E57
#8797A8
#A7BCD1
```
#### 1.3.2. BOOTSTRAP BREAKPOINTS
```css
root {
    --bs-breakpoint-xs: 0;
    --bs-breakpoint-sm: 576px;
    --bs-breakpoint-md: 768px;
    --bs-breakpoint-lg: 992px;
    --bs-breakpoint-xl: 1200px;
    --bs-breakpoint-xxl: 1400px;
}
```

## 2. LUCIDE-REACT

### 2.1. LUCIDE REACT INSTALLATION
```bash
npm install lucide-react
```

### 2.2. USAGE/SETUP

```js
import React from 'react'
import { Eye, EyeOff, Bug  } from 'lucide-react';
```
```jsx
   <p className='loginErrorMessage'>
        <Bug size={20} fontWeight={900} aria-hidden='true' focusable='false'/>
        Password is required
    </p>
```


