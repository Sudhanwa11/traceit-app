import React from 'react';
import { useTranslation } from 'react-i18next';
import './HelpPage.css';

const HelpPage = () => {
  const { t } = useTranslation();

  return (
    <div className="help-page-container">
      <h2>{t('helpPage.title', 'Help Center')}</h2>

      {/* Getting Started */}
      <div className="help-section">
        <h3>{t('helpPage.gettingStartedTitle', 'Getting Started')}</h3>

        <div className="qa-block">
          <h4>{t('helpPage.q1', 'How do I register?')}</h4>
          <p>
            {t(
              'helpPage.a1',
              "Click the 'Register' button on the navbar and fill in your college details. You will need a valid college email and roll number to sign up."
            )}
          </p>
        </div>

        <div className="qa-block">
          <h4>{t('helpPage.q2', 'How do I report an item I found?')}</h4>
          <p>
            {t(
              'helpPage.a2',
              "Navigate to the 'Report Item' page from the navbar. Fill in all the details as accurately as possible—especially category, sub-category, location and description. Uploading a clear photo is highly recommended; it greatly improves AI matching and successful returns."
            )}
          </p>
          <ul className="bullets">
            <li>{t('helpPage.tipsPhoto', 'Upload at least one clear photo showing unique marks')}</li>
            <li>{t('helpPage.tipsTitle', 'Use a precise title, e.g., “Black Leather Wallet”')}</li>
            <li>{t('helpPage.tipsLocation', 'Add where you found it and where it is now')}</li>
          </ul>
        </div>
      </div>

      {/* Request & AI Matching */}
      <div className="help-section">
        <h3>{t('helpPage.matchingTitle', 'Request & AI Matching')}</h3>

        <div className="qa-block">
          <h4>{t('helpPage.qRequest', 'How do I request a lost item?')}</h4>
          <p>
            {t(
              'helpPage.aRequest',
              "Open 'Request Item', describe what you lost, and submit. You’ll be taken to the Matches page where our AI suggests likely found items."
            )}
          </p>
          <div className="tip">
            {t(
              'helpPage.tipBilingual',
              'Bilingual matching: English/Hindi descriptions are matched using an offline multilingual model (e.g., “wallet” ↔ “बटुआ”).'
            )}
          </div>
        </div>

        <div className="qa-block">
          <h4>{t('helpPage.qRefresh', 'How do I refresh matches?')}</h4>
          <p>
            {t(
              'helpPage.aRefresh',
              "Use the 'Search matches now' button to re-run AI matching. New posts appear here as they are reported. Retrieved items are automatically removed from matches."
            )}
          </p>
        </div>
      </div>

      {/* Claims & Chat */}
      <div className="help-section">
        <h3>{t('helpPage.claimsTitle', 'Claims & Chat')}</h3>

        <div className="qa-block">
          <h4>{t('helpPage.q3', 'How do I claim an item?')}</h4>
          <p>
            {t(
              'helpPage.a3',
              "On the Matches page, click 'Request to Chat & Claim' on an item you believe is yours. The reporter gets a chat request and can approve or reject it."
            )}
          </p>
        </div>

        <div className="qa-block">
          <h4>{t('helpPage.q4', 'Where can I manage my claims?')}</h4>
          <p>
            {t(
              'helpPage.a4',
              "Use the 'My Queries' page. You’ll see two sections: claims others made on your items, and claims you made on others’ items. Each claim shows its current status and next actions."
            )}
          </p>
          <ul className="status-list">
            <li><strong>Pending Chat Approval</strong> — {t('helpPage.statusPending', 'Reporter needs to approve your chat request.')}</li>
            <li><strong>Chat Active</strong> — {t('helpPage.statusChat', 'Both parties can exchange messages instantly.')}</li>
            <li><strong>Resolved by Reporter</strong> — {t('helpPage.statusResolved', 'Reporter marked as returned; claimer must confirm retrieval.')}</li>
            <li><strong>Retrieval Confirmed</strong> — {t('helpPage.statusConfirmed', 'Process complete. Points awarded to reporter.')}</li>
            <li><strong>Chat Rejected</strong> — {t('helpPage.statusRejected', 'Request was declined; you can claim a different item.')}</li>
          </ul>
        </div>

        <div className="qa-block">
          <h4>{t('helpPage.q5', 'What is the full claim flow?')}</h4>
          <ol className="steps">
            <li>{t('helpPage.flow1', 'Requester clicks Claim on a matched found item.')}</li>
            <li>{t('helpPage.flow2', 'Reporter approves chat; both verify ownership (unique marks, photos, etc.).')}</li>
            <li>{t('helpPage.flow3', 'They meet to hand over the item safely (ideally in a public campus spot).')}</li>
            <li>{t('helpPage.flow4', 'Reporter marks the claim as resolved; requester confirms retrieval.')}</li>
            <li>{t('helpPage.flow5', 'Reporter receives +100 Service Points; item disappears from active feeds and Matches.')}</li>
          </ol>
        </div>
      </div>

      {/* Rewards */}
      <div className="help-section">
        <h3>{t('helpPage.rewardsTitle', 'Rewards')}</h3>
        <div className="qa-block">
          <h4>{t('helpPage.qRewards', 'How do rewards work?')}</h4>
          <p>
            {t(
              'helpPage.aRewards',
              'When a found item is successfully returned and confirmed, the reporter is awarded Service Points automatically. Track your progress on the Rewards page.'
            )}
          </p>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="help-section">
        <h3>{t('helpPage.troublesTitle', 'Troubleshooting')}</h3>

        <div className="qa-block">
          <h4>{t('helpPage.qNoMatches', 'I don’t see any matches')}</h4>
          <ul className="bullets">
            <li>{t('helpPage.fix1', 'Re-check your title/sub-category and description for clarity.')}</li>
            <li>{t('helpPage.fix2', 'Add a photo if possible; it helps reporters recognize your item.')}</li>
            <li>{t('helpPage.fix3', 'Click “Search matches now” to refresh—new posts appear daily.')}</li>
          </ul>
        </div>

        <div className="qa-block">
          <h4>{t('helpPage.qChatDelay', 'Chat messages aren’t appearing instantly')}</h4>
          <p>
            {t(
              'helpPage.aChatDelay',
              'Check your internet connection. The chat is real-time via sockets; if you’ve been idle for a while, it may reconnect automatically when you send a message.'
            )}
          </p>
        </div>
      </div>

      {/* Privacy & Safety */}
      <div className="help-section">
        <h3>{t('helpPage.safetyTitle', 'Privacy & Safety')}</h3>
        <div className="qa-block">
          <h4>{t('helpPage.qPrivacy', 'How is my data handled?')}</h4>
          <p>
            {t(
              'helpPage.aPrivacy',
              'Text matching runs locally using an offline multilingual model; photos and chat are stored securely. Only essential details are shared during the claim/chat process.'
            )}
          </p>
          <div className="tip">
            {t(
              'helpPage.tipMeet',
              'For handovers, meet in public campus areas (e.g., library front desk) and verify identity politely.'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
