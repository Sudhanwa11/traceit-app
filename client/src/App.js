import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import io from 'socket.io-client';

// Import Components
import Navbar from './components/layout/Navbar';
import NotificationToast from './components/common/NotificationToast';

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
import ChatPage from './pages/ChatPage';
import Footer from './components/layout/Footer';
import HelpPage from './pages/HelpPage';

import './App.css';
import { useTranslation } from 'react-i18next';

// This new component wraps our app to handle the socket connection
const AppWrapper = () => {
    const { user } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const { t } = useTranslation();
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        // Connect to the socket server
        const newSocket = io("http://localhost:5000");
        setSocket(newSocket);

        // Disconnect when the component unmounts
        return () => {
            newSocket.close();
        }
    }, []);

    useEffect(() => {
        // When the user logs in, send their ID to the server
        if (socket && user) {
            socket.emit("addUser", user._id);
        }
    }, [socket, user]);

    useEffect(() => {
        // Listen for incoming notifications from the server
        if (socket) {
            socket.on("newNotification", (data) => {
                setNotification(data.message);
                // Make the notification disappear after 5 seconds
                setTimeout(() => {
                    setNotification(null);
                }, 5000);
            });

            // --- ADD THIS NEW LISTENER ---
            socket.on("misuseNotification", (data) => {
                setNotification(data.message);
                setTimeout(() => setNotification(null), 5000);
            });
        }
    }, [socket, t]);

    return (
      <Router>
        {notification && <NotificationToast message={notification} onClose={() => setNotification(null)} />}
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
            <Route path="/chat/:claimId" element={<ChatPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    );
}

// The main App component that provides context to the wrapper
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppWrapper />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;