// client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import { ThemeProvider } from './context/ThemeContext';

// Import all pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReportItemPage from './pages/ReportItemPage';
import RequestItemPage from './pages/RequestItemPage';
import ProfilePage from './pages/ProfilePage';
import RewardsPage from './pages/RewardsPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import QueryPage from './pages/QueryPage';
import MatchesPage from './pages/MatchesPage';
import MatchesRedirectPage from './pages/MatchesRedirectPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Navbar />
            <main className="container" style={{ padding: '20px' }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/report" element={<ReportItemPage />} />
                <Route path="/request" element={<RequestItemPage />} />
                <Route path="/query" element={<QueryPage />} />
                <Route path="/matches" element={<MatchesRedirectPage />} />
                <Route path="/matches/:itemId" element={<MatchesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </main>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;