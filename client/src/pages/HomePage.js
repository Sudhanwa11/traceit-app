import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import LogoLight from '../assets/logo.png';
import LogoDark from '../assets/logo-dark.png';
import './HomePage.css';
import FAQ from '../components/home/FAQ';

const HomePage = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const currentLogo = theme === 'dark' ? LogoDark : LogoLight;

  const WelcomeContent = () => {
    if (authLoading) return <div className="loader" />;
    return isAuthenticated && user ? (
      <div className="welcome-text">
        <h2 className="title-animation">
          {t('homePage.welcomeBack', 'Welcome back,')} {user.name}!
        </h2>
        <p className="subtitle-animation">{t('homePage.whatToDo', 'What would you like to do today?')}</p>
      </div>
    ) : (
      <div className="welcome-text">
        <h2 className="title-animation">
          {t('homePage.mainTitle', 'Lost & Found, made simple.')}
        </h2>
        <p className="subtitle-animation">
          {t('homePage.subtitle', 'The easiest way to report and find items on campus.')}
        </p>
      </div>
    );
  };

  return (
    <div className="homepage">
      <header className="hero-section">
        <WelcomeContent />
        <div className="hero-logo-container">
          <img src={currentLogo} alt="TraceIt Logo" className="hero-logo" />
        </div>
      </header>

      <div className="elegant-divider"></div>

      {/* --- Why TraceIt on Campus (5 reasons) --- */}
      <section className="why-traceit">
        <h3>{t('homePageBenefits.title2', 'Why Use TraceIt on Campus?')}</h3>
        <div className="reasons-grid">
          <div className="reason-card">
            <span className="reason-icon">⚡️</span>
            <h4>{t('homePageBenefits.quickTitle', 'Quick & Easy Reporting')}</h4>
            <p>
              {t(
                'homePageBenefits.quickText',
                'Report found or lost items in under a minute with guided forms and photo uploads.'
              )}
            </p>
          </div>

          <div className="reason-card">
            <span className="reason-icon">🤖</span>
            <h4>{t('homePageBenefits.aiTitle', 'AI-Powered, Multilingual Matching')}</h4>
            <p>
              {t(
                'homePageBenefits.aiText',
                'Semantic search matches your items by meaning (not just keywords) and works across English & Hindi.'
              )}
            </p>
          </div>

          <div className="reason-card">
            <span className="reason-icon">🔐</span>
            <h4>{t('homePageBenefits.privacyTitle', 'Private & Secure Chat')}</h4>
            <p>
              {t(
                'homePageBenefits.privacyText',
                'Only names and departments are shared. Chat is approved by the reporter before starting.'
              )}
            </p>
          </div>

          <div className="reason-card">
            <span className="reason-icon">🏆</span>
            <h4>{t('homePageBenefits.rewardsTitle', 'Service Points & Rewards')}</h4>
            <p>
              {t(
                'homePageBenefits.rewardsText',
                'Reporters earn +100 points when a retrieval is confirmed. Track progress toward campus rewards.'
              )}
            </p>
          </div>

          <div className="reason-card">
            <span className="reason-icon">🔔</span>
            <h4>{t('homePageBenefits.liveTitle', 'Live Updates & Cleaner Matches')}</h4>
            <p>
              {t(
                'homePageBenefits.liveText',
                'Matches refresh on demand and retrieved items auto-disappear, keeping results relevant.'
              )}
            </p>
          </div>
        </div>
      </section>

      <div className="elegant-divider"></div>

      <FAQ />
    </div>
  );
};

export default HomePage;
