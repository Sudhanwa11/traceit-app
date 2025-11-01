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
          {t('homePage.welcomeBack')} {user.name}!
        </h2>
        <p className="subtitle-animation">{t('homePage.whatToDo')}</p>
      </div>
    ) : (
      <div className="welcome-text">
        <h2 className="title-animation">
          {t('homePage.mainTitle')}
        </h2>
        <p className="subtitle-animation">
          {t('homePage.subtitle')}
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
        <h3>{t('homePageBenefits.title')}</h3>
        <div className="reasons-grid">
          <div className="reason-card">
            <span className="reason-icon">⚡️</span>
            <h4>{t('homePageBenefits.quickTitle')}</h4>
            <p>{t('homePageBenefits.quickText')}</p>
          </div>

          <div className="reason-card">
            <span className="reason-icon">🤖</span>
            <h4>{t('homePageBenefits.aiTitle')}</h4>
            <p>{t('homePageBenefits.aiText')}</p>
          </div>

          <div className="reason-card">
            <span className="reason-icon">🔐</span>
            <h4>{t('homePageBenefits.privacyTitle')}</h4>
            <p>{t('homePageBenefits.privacyText')}</p>
          </div>

          <div className="reason-card">
            <span className="reason-icon">🏆</span>
            <h4>{t('homePageBenefits.rewardsTitle')}</h4>
            <p>{t('homePageBenefits.rewardsText')}</p>
          </div>

          <div className="reason-card">
            <span className="reason-icon">🔔</span>
            <h4>{t('homePageBenefits.liveTitle')}</h4>
            <p>{t('homePageBenefits.liveText')}</p>
          </div>
        </div>
      </section>

      <div className="elegant-divider"></div>

      <FAQ />
    </div>
  );
};

export default HomePage;
