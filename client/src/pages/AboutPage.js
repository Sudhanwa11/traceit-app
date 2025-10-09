// client/src/pages/AboutPage.js
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
          {t('aboutPage.title', 'About TraceIt')}
        </h2>

        {/* Mission */}
        <section className="about-section">
          <h3>{t('aboutPage.mainHeading', 'Our Mission')}</h3>
          <p>
            {t(
              'aboutPage.missionText',
              'TraceIt’s mission is to provide a seamless and efficient platform for managing lost and found items within the campus community. We reconnect students and staff with their valuable belongings, fostering a more connected and supportive environment.'
            )}
          </p>
        </section>

        {/* How it works (3 core steps) */}
        <section className="about-section">
          <h3>{t('aboutPage.howItWorks', 'How It Works')}</h3>

          <ul className="how-it-works-list">
            <li>
              <h4>{t('aboutPage.step1', 'Report or Request')}</h4>
              <p>
                {t(
                  'aboutPage.step1Text',
                  'Found something? Report it in seconds. Lost something? Post a request and let the community help you out.'
                )}
              </p>
            </li>
            <li>
              <h4>{t('aboutPage.step2', 'Smart Matching')}</h4>
              <p>
                {t(
                  'aboutPage.step2Text',
                  'Our AI-powered system analyzes descriptions, categories, locations, and photos to help you find potential matches quickly — even across English and Hindi.'
                )}
              </p>
            </li>
            <li>
              <h4>{t('aboutPage.step3', 'Connect & Retrieve')}</h4>
              <p>
                {t(
                  'aboutPage.step3Text',
                  'Once a match is found, you can chat securely to verify ownership and arrange the handover.'
                )}
              </p>
            </li>
          </ul>
        </section>

        {/* Feature highlights (new) */}
        <section className="about-section">
          <h3>{t('aboutPage.featuresTitle', 'What Makes TraceIt Different')}</h3>

          <div className="about-grid">
            <article className="about-tile">
              <h4>{t('aboutPage.featureAI', 'Bilingual AI Matching')}</h4>
              <p>
                {t(
                  'aboutPage.featureAIText',
                  'We use an offline multilingual transformer so descriptions in English and Hindi can match accurately (e.g., “wallet” ↔ “बटुआ”).'
                )}
              </p>
            </article>

            <article className="about-tile">
              <h4>{t('aboutPage.featureChat', 'Safe Chat & Claims')}</h4>
              <p>
                {t(
                  'aboutPage.featureChatText',
                  'Claim an item, the reporter approves chat, and both parties verify details before meeting to retrieve the item.'
                )}
              </p>
            </article>

            <article className="about-tile">
              <h4>{t('aboutPage.featureRewards', 'Rewards & Recognition')}</h4>
              <p>
                {t(
                  'aboutPage.featureRewardsText',
                  'Successful returns automatically award Service Points (e.g., +100 per retrieval) unlocking campus rewards.'
                )}
              </p>
            </article>

            <article className="about-tile">
              <h4>{t('aboutPage.featureRealtime', 'Real-Time Updates')}</h4>
              <p>
                {t(
                  'aboutPage.featureRealtimeText',
                  'You’ll see new messages instantly and claim status changes reflected across Matches and My Queries.'
                )}
              </p>
            </article>
          </div>
        </section>

        {/* Claim flow summary (new) */}
        <section className="about-section">
          <h3>{t('aboutPage.flowTitle', 'Claim & Retrieval Flow')}</h3>
          <ol className="about-flow">
            <li>
              <strong>{t('aboutPage.flow1', 'Claim')}</strong> —{' '}
              {t(
                'aboutPage.flow1Text',
                'The requester claims a found item from the Matches page.'
              )}
            </li>
            <li>
              <strong>{t('aboutPage.flow2', 'Approve Chat')}</strong> —{' '}
              {t(
                'aboutPage.flow2Text',
                'The reporter reviews and accepts/rejects the chat request.'
              )}
            </li>
            <li>
              <strong>{t('aboutPage.flow3', 'Verify')}</strong> —{' '}
              {t(
                'aboutPage.flow3Text',
                'Both users verify details (photo, description, unique marks) in chat.'
              )}
            </li>
            <li>
              <strong>{t('aboutPage.flow4', 'Resolve')}</strong> —{' '}
              {t(
                'aboutPage.flow4Text',
                'Reporter marks the claim resolved after handover; claimer confirms retrieval.'
              )}
            </li>
            <li>
              <strong>{t('aboutPage.flow5', 'Reward')}</strong> —{' '}
              {t(
                'aboutPage.flow5Text',
                'The system awards Service Points and removes the retrieved item from active feeds and Matches.'
              )}
            </li>
          </ol>
        </section>

        {/* Privacy & Stack (new) */}
        <section className="about-section">
          <h3>{t('aboutPage.techTitle', 'Privacy-First Technology')}</h3>
          <p>
            {t(
              'aboutPage.techText',
              'TraceIt runs bilingual text matching locally using Xenova’s multilingual transformer (no external calls for embeddings). Images are stored securely, and chat/notifications run over sockets. We use MongoDB with vector search where available, with a local cosine fallback to stay resilient.'
            )}
          </p>
        </section>

        {/* Creators */}
        <section className="about-section creator-section">
          <h3>{t('aboutPage.creatorTitle', 'About the Creators')}</h3>
          <p>
            {t(
              'aboutPage.creatorText',
              'TraceIt was built to make campus life better through practical innovation. It is maintained with care and continuously improved based on real user feedback.'
            )}
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
