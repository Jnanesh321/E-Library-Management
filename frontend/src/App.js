import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import PortalSelection from './pages/PortalSelection.jsx';
import UserLogin from './pages/UserLogin.jsx'; // Add this
import AdminLogin from './pages/AdminLogin.jsx'; // Add this (after you create the file)
import Dashboard from './pages/Dashboard.jsx';
function App() {
  return (
    <Router>
      <Routes>
        {/* Main Entry Point */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Portal Choice */}
        <Route path="/get-started" element={<PortalSelection />} />
        
        {/* Specific Login Routes */}
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Future Dashboard Route Placeholder */}
       <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;