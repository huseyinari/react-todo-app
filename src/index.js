import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import "./css/app.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/antd.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);