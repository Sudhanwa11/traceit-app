// client/src/pages/ProfilePage.js
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Import the hook
import { AuthContext } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(); // 2. Initialize the hook
    const { user, isAuthenticated, loading } = useContext(AuthContext);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading || !user) {
        return <div className="loader">Loading Profile...</div>;
    }

    // 3. Use the t() function for all text content
    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <h2>{t('profilePage.title')}</h2>
                    <button className="edit-profile-btn">{t('profilePage.editButton')}</button>
                </div>
                <div className="profile-details">
                    <div className="info-field">
                        <span className="info-label">{t('profilePage.name')}</span>
                        <span className="info-value">{user.name}</span>
                    </div>
                    <div className="info-field">
                        <span className="info-label">{t('profilePage.email')}</span>
                        <span className="info-value">{user.email}</span>
                    </div>
                    <div className="info-field">
                        <span className="info-label">{t('profilePage.rollNumber')}</span>
                        <span className="info-value">{user.rollNumber}</span>
                    </div>
                    <div className="info-field">
                        <span className="info-label">{t('profilePage.phoneNumber')}</span>
                        <span className="info-value">{user.phoneNumber}</span>
                    </div>
                    <div className="info-field">
                        <span className="info-label">{t('profilePage.department')}</span>
                        <span className="info-value">{user.department}</span>
                    </div>
                </div>
                <div className="service-points-section">
                    <h3>{t('profilePage.servicePointsTitle')}</h3>
                    <p className="points-display">{user.servicePoints}</p>
                    <p className="points-description">{t('profilePage.pointsDescription')}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;