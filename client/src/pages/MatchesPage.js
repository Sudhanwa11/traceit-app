import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import itemService from '../services/itemService';
import ItemCard from '../components/items/ItemCard';
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

    const [message, setMessage] = useState(''); // For success messages
    const [error, setError] = useState('');     // For error messages

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        } else if (isAuthenticated && itemId) {
            const fetchAllData = async () => {
                setLoading(true);
                try {
                    const [itemData, matchData] = await Promise.all([
                        itemService.getItemById(itemId),
                        itemService.findMatches(itemId)
                    ]);
                    setOriginalItem(itemData);
                    setMatches(matchData.matches);
                    setSelfMatchCount(matchData.selfMatchCount);
                } catch (err) {
                    console.error("Failed to fetch matches:", err);
                    setError(err.response?.data?.msg || t('matchesPage.fetchError'));
                } finally {
                    setLoading(false);
                }
            };
            fetchAllData();
        }
    }, [itemId, isAuthenticated, authLoading, navigate, t]); // Added t to dependency array

    // --- UPDATED: handleClaimItem now directly creates a claim ---
    const handleClaimItem = async (matchedItemId) => {
        setMessage(''); // Clear previous messages
        setError('');
        try {
            await itemService.createClaim(matchedItemId);
            setMessage(t('claimModal.claimSentSuccess')); 
        } catch (err) {
            console.error("Failed to create claim:", err);
            setError(err.response?.data?.msg || t('claimModal.claimSentError')); // Use new translation key for error
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
            
            <section className="matches-section">
                <h3>{t('matchesPage.aiResults')}</h3>
                <div className="items-grid">
                    {matches.length > 0 ? (
                        matches.map(item => (
                            <ItemCard 
                                key={item._id} 
                                item={item} 
                                isMatch={true}
                                actionButton={{
                                    text: t('matchesPage.claimButton'),
                                    onClick: () => handleClaimItem(item._id) // Direct call
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