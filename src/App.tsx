
import './App.css';
import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router,Route,Routes } from "react-router-dom";
import Dashboard from './Dashboard/dashboard';
import React from 'react';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Router>
  );
};


export default App;
