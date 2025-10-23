import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Components/home";
import BookingHistory from "./Components/BookingHistory";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bookings" element={<BookingHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
