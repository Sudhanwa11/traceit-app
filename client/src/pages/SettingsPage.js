// client/src/pages/SettingsPage.js
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import './SettingsPage.css';

const SettingsPage = () => {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useContext(ThemeContext);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="settings-container">
            <h2>{t('settings.title')}</h2>

            {/* --- Language Section --- */}
            <div className="settings-card">
                <h3>{t('settings.languageTitle')}</h3>
                <p>{t('settings.languageDesc')}</p>
                <div className="language-buttons">
                    <button 
                        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                        onClick={() => changeLanguage('en')}
                    >
                        English
                    </button>
                    <button 
                        className={`lang-btn ${i18n.language === 'hi' ? 'active' : ''}`}
                        onClick={() => changeLanguage('hi')}
                    >
                        हिन्दी (Hindi)
                    </button>
                </div>
            </div>

            {/* --- Dark Mode Section --- */}
            <div className="settings-card">
                <h3>{t('settings.darkModeTitle')}</h3>
                <p>{t('settings.darkModeDesc')}</p>
                <div className="toggle-switch-container">
                    <span>Light</span>
                    <label className="toggle-switch">
                        <input 
                            type="checkbox" 
                            checked={theme === 'dark'} 
                            onChange={toggleTheme} 
                        />
                        <span className="slider"></span>
                    </label>
                    <span>Dark</span>
                </div>
            </div>

            {/* --- Account Management Section --- */}
            <div className="settings-card">
                <h3>{t('settings.accountTitle')}</h3>
                <button className="settings-btn">{t('settings.changePassword')}</button>
                <button className="settings-btn btn-danger">{t('settings.deleteAccount')}</button>
            </div>
            
            {/* --- Support Section --- */}
            <div className="settings-card">
                <h3>{t('settings.helpTitle')}</h3>
                <button className="settings-btn">{t('settings.help')}</button>
                <button className="settings-btn">{t('settings.feedback')}</button>
            </div>
        </div>
    );
};

export default SettingsPage;