// client/src/pages/MatchesPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import itemService from '../services/itemService';
import ItemCard from '../components/items/ItemCard';
import { getSocket } from '../utils/socket';           
import './MatchesPage.css';

const MatchesPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [originalItem, setOriginalItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selfMatchCount, setSelfMatchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const applySafeFilter = useCallback((list) => {
    // Guard: hide anything already retrieved (belt-and-suspenders)
    return (list || []).filter(m => !m.isRetrieved);
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const [itemData, matchData] = await Promise.all([
        itemService.getItemById(itemId),
        itemService.findMatches(itemId),
      ]);
      setOriginalItem(itemData);
      setMatches(applySafeFilter(matchData.matches || []));
      setSelfMatchCount(matchData.selfMatchCount || 0);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
      setError(err?.response?.data?.msg || t('matchesPage.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [itemId, t, applySafeFilter]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    } else if (isAuthenticated && itemId) {
      fetchAllData();
    }
  }, [itemId, isAuthenticated, authLoading, navigate, fetchAllData]);

  // 🔴 Live removal of retrieved items
  useEffect(() => {
    const socket = getSocket();
    const onItemRetrieved = ({ itemId: retrievedId }) => {
      setMatches(prev => prev.filter(m => String(m._id) !== String(retrievedId)));
    };
    socket.on('itemRetrieved', onItemRetrieved);
    return () => {
      socket.off('itemRetrieved', onItemRetrieved);
    };
  }, []);

  const handleRefreshMatches = async () => {
    if (!itemId) return;
    setRefreshing(true);
    setError('');
    setMessage(t('matchesPage.refreshing', 'Searching the latest matches...'));
    try {
      const matchData = await itemService.findMatches(itemId);
      setMatches(applySafeFilter(matchData.matches || []));
      setSelfMatchCount(matchData.selfMatchCount || 0);
      setMessage(t('matchesPage.refreshed', 'Results updated.'));
    } catch (err) {
      console.error('Failed to refresh matches:', err);
      setError(err?.response?.data?.msg || t('matchesPage.fetchError'));
      setMessage('');
    } finally {
      setRefreshing(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const handleClaimItem = async (matchedItemId) => {
    setMessage('');
    setError('');
    try {
      await itemService.createClaim(matchedItemId);
      setMessage(t('claimModal.claimSentSuccess'));
      // Optional UX: optimistically keep card, or hide it:
      // setMatches(prev => prev.filter(m => m._id !== matchedItemId));
    } catch (err) {
      console.error('Failed to create claim:', err);
      setError(err?.response?.data?.msg || t('claimModal.claimSentError'));
    }
  };

  if (loading || authLoading) {
    return <div className="loader">{t('matchesPage.loadingMatches')}</div>;
  }

  return (
    <div className="matches-page-container">
      {message && <div className="success-message page-message">{message}</div>}
      {error && <div className="error-message page-message">{error}</div>}

      <h2>{t('matchesPage.title')}</h2>

      {selfMatchCount > 0 && (
        <div className="warning-message">
          <h3>{t('matchesPage.selfMatchWarningTitle')}</h3>
          <p>{t('matchesPage.selfMatchWarningText')}</p>
        </div>
      )}

      {originalItem && (
        <section className="original-item-section">
          <h3>{t('matchesPage.yourRequest')}</h3>
          <ItemCard item={originalItem} />
        </section>
      )}

      <div className="elegant-divider"></div>

      {/* --- AI RESULTS SECTION --- */}
      <section className="matches-section">
        {matches.length > 0 ? (
          <div className="matches-header">
            <h3>{t('matchesPage.aiResults')}</h3>
            <button
              className="btn-match"
              onClick={handleRefreshMatches}
              disabled={refreshing}
              type="button"
              aria-label={t('matchesPage.refreshNow', 'Search matches now')}
            >
              {refreshing
                ? t('matchesPage.refreshing', 'Searching…')
                : t('matchesPage.refreshNow', 'Search matches now')}
            </button>
          </div>
        ) : (
          <>
            <h3 className="matches-title-center">{t('matchesPage.aiResults')}</h3>
            <div className="matches-cta-full">
              <button
                className="btn-match"
                onClick={handleRefreshMatches}
                disabled={refreshing}
                type="button"
              >
                {refreshing
                  ? t('matchesPage.refreshing', 'Searching…')
                  : t('matchesPage.refreshNow', 'Search matches now')}
              </button>
            </div>
          </>
        )}

        <div className="items-grid">
          {matches.length > 0 ? (
            matches.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                isMatch={true}
                actionButton={{
                  text: t('matchesPage.claimButton'),
                  onClick: () => handleClaimItem(item._id),
                }}
              />
            ))
          ) : (
            <div className="empty-message">
              <p>{t('matchesPage.noMatches')}</p>
              <p>{t('matchesPage.noMatchesInfo')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MatchesPage;
