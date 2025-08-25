// client/src/pages/AboutPage.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import './AboutPage.css';

const AboutPage = () => {
    const { t } = useTranslation();

    return (
        <div className="about-container">
            <div className="about-card">
                <h2 className="about-title">{t('aboutPage.title')}</h2>

                <section className="about-section">
                    <h3>{t('aboutPage.mainHeading')}</h3>
                    <p>{t('aboutPage.missionText')}</p>
                </section>

                <section className="about-section">
                    <h3>{t('aboutPage.howItWorks')}</h3>
                    <ul className="how-it-works-list">
                        <li>
                            <h4>{t('aboutPage.step1')}</h4>
                            <p>{t('aboutPage.step1Text')}</p>
                        </li>
                        <li>
                            <h4>{t('aboutPage.step2')}</h4>
                            <p>{t('aboutPage.step2Text')}</p>
                        </li>
                        <li>
                            <h4>{t('aboutPage.step3')}</h4>
                            <p>{t('aboutPage.step3Text')}</p>
                        </li>
                    </ul>
                </section>

                <section className="about-section creator-section">
                    <h3>{t('aboutPage.creatorTitle')}</h3>
                    <p>{t('aboutPage.creatorText')}</p>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;