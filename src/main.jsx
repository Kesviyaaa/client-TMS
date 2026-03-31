import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import "./App.css";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')).render(

    <HashRouter>
        <App />
    </HashRouter>

)