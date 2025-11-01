import React from 'react';
import { useTranslation } from 'react-i18next';
import './AboutPage.css';

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="about-container">
      <div className="about-card">
        {/* Page Title */}
        <h2 className="about-title">
          {t('aboutPage.title')}
        </h2>

        {/* Mission */}
        <section className="about-section">
          <h3>{t('aboutPage.mainHeading')}</h3>
          <p>
            {t('aboutPage.missionText')}
          </p>
        </section>

        {/* How it works (3 core steps) */}
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

        {/* Feature highlights (new) */}
        <section className="about-section">
          <h3>{t('aboutPage.featuresTitle')}</h3>

          <div className="about-grid">
            <article className="about-tile">
              <h4>{t('aboutPage.featureAI')}</h4>
              <p>{t('aboutPage.featureAIText')}</p>
            </article>

            <article className="about-tile">
              <h4>{t('aboutPage.featureChat')}</h4>
              <p>{t('aboutPage.featureChatText')}</p>
            </article>

            <article className="about-tile">
              <h4>{t('aboutPage.featureRewards')}</h4>
              <p>{t('aboutPage.featureRewardsText')}</p>
            </article>

            <article className="about-tile">
              <h4>{t('aboutPage.featureRealtime')}</h4>
              <p>{t('aboutPage.featureRealtimeText')}</p>
            </article>
          </div>
        </section>

        {/* Claim flow summary (new) */}
        <section className="about-section">
          <h3>{t('aboutPage.flowTitle')}</h3>
          <ol className="about-flow">
            <li>
              <strong>{t('aboutPage.flow1')}</strong> — {t('aboutPage.flow1Text')}
            </li>
            <li>
              <strong>{t('aboutPage.flow2')}</strong> — {t('aboutPage.flow2Text')}
            </li>
            <li>
              <strong>{t('aboutPage.flow3')}</strong> — {t('aboutPage.flow3Text')}
            </li>
            <li>
              <strong>{t('aboutPage.flow4')}</strong> — {t('aboutPage.flow4Text')}
            </li>
            <li>
              <strong>{t('aboutPage.flow5')}</strong> — {t('aboutPage.flow5Text')}
            </li>
          </ol>
        </section>

        {/* Privacy & Stack (new) */}
        <section className="about-section">
          <h3>{t('aboutPage.techTitle')}</h3>
          <p>{t('aboutPage.techText')}</p>
        </section>

        {/* Creators */}
        <section className="about-section creator-section">
          <h3>{t('aboutPage.creatorTitle')}</h3>
          <p>{t('aboutPage.creatorText')}</p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
