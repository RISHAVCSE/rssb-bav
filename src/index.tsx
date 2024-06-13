import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard/dashboard';
import BookDashboard from './BookDashboard/BookDashboard';

const router = (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/books" element={<BookDashboard />} />
  </Routes>
);

ReactDOM.render(
  <React.StrictMode>
    <Router>
      {router}
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
