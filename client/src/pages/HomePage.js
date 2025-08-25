// client/src/pages/HomePage.js
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import Logo from '../assets/logo.png'; // Make sure your logo is here
import './HomePage.css';

const HomePage = () => {
    const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
    const { t } = useTranslation();

    const WelcomeContent = () => {
        if (authLoading) {
            return <div className="loader"></div>;
        }
        return isAuthenticated && user ? (
            <div className="welcome-text">
                <h2 className="title-animation">{t('homePage.welcomeBack')} {user.name}!</h2>
                <p className="subtitle-animation">{t('homePage.whatToDo')}</p>
            </div>
        ) : (
            <div className="welcome-text">
                <h2 className="title-animation">{t('homePage.mainTitle')}</h2>
                <p className="subtitle-animation">{t('homePage.subtitle')}</p>
            </div>
        );
    };

    return (
        <div className="homepage">
            <header className="hero-section">
                <WelcomeContent />
                <div className="hero-logo-container">
                    <img src={Logo} alt="TraceIt Logo" className="hero-logo" />
                </div>
            </header>

            <div className="elegant-divider"></div>

            <section className="benefits-section">
                <h3>{t('homePageBenefits.title')}</h3>
                <div className="benefits-cards">
                    <div className="benefit-card">
                        <span className="card-icon">📄</span>
                        <h4>{t('homePageBenefits.card1Title')}</h4>
                        <p>{t('homePageBenefits.card1Text')}</p>
                    </div>
                    <div className="benefit-card">
                        <span className="card-icon">🤖</span>
                        <h4>{t('homePageBenefits.card2Title')}</h4>
                        <p>{t('homePageBenefits.card2Text')}</p>
                    </div>
                    <div className="benefit-card">
                        <span className="card-icon">🏆</span>
                        <h4>{t('homePageBenefits.card3Title')}</h4>
                        <p>{t('homePageBenefits.card3Text')}</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;