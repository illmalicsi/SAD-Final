import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Components/home";
import BookingHistory from "./Components/BookingHistory";
import AdminExpenses from "./Components/AdminExpenses";
import FinancialReport from "./Components/FinancialReport";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bookings" element={<BookingHistory />} />
        <Route path="/admin/expenses" element={<AdminExpenses />} />
        <Route path="/admin/reports/financial" element={<FinancialReport />} />
      </Routes>
    </Router>
  );
}

export default App;
