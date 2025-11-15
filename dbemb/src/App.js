import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Components/home";
import BookingHistory from "./Components/BookingHistory";
import AdminExpenses from "./Components/AdminExpenses";
import FinancialReport from "./Components/FinancialReport";
import TestPaymentGateway from "./Components/TestPaymentGateway";
import ExactPaymentGateway from "./Components/ExactPaymentGateway";
import InstrumentItemsManager from "./Components/InstrumentItemsManager";
import MaintenanceManager from "./Components/MaintenanceManager";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reset-password" element={<Home />} />
        <Route path="/bookings" element={<BookingHistory />} />
        <Route path="/admin/expenses" element={<AdminExpenses />} />
        <Route path="/admin/reports/financial" element={<FinancialReport />} />
        <Route path="/payment" element={<TestPaymentGateway />} />
        <Route path="/pay-exact" element={<ExactPaymentGateway />} />
        <Route path="/admin/instrument-items" element={<InstrumentItemsManager />} />
        <Route path="/admin/maintenance" element={<MaintenanceManager />} />
      </Routes>
    </Router>
  );
}

export default App;
