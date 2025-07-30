import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard/dashboard';
import BookDashboard from './BookDashboard/BookDashboard';
import CentreData from './CentreData/CentreData';
import AllocationPage from './AllocationApproval/AllocationApproval';
import ReceiptHistoryTable from './ReceiptHistoryTable/ReceiptHistoryTable';
import CentreManagement from './CentreList';

const router = (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/books" element={<BookDashboard />} />
    <Route path="/centre" element={<CentreData />} />
    <Route path="/approval" element={<AllocationPage />} />
    <Route path="/historyReceipt" element={<ReceiptHistoryTable />} />
    <Route path="/centre-list" element={<CentreManagement />} />



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
