import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import itemService from '../services/itemService';
import ProgressBar from '../components/rewards/ProgressBar';
import rewardService from '../services/rewardService'; // Import the reward service
import './RewardsPage.css';

const RewardsPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, isAuthenticated, loading: authLoading, loadUser } = useContext(AuthContext); // Get loadUser
    const [retrievedItems, setRetrievedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claimMessage, setClaimMessage] = useState(''); // New state for messages

    const REWARD_GOAL = 500;

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        } else if (isAuthenticated) {
            const fetchItems = async () => {
                try {
                    const items = await itemService.getMyRetrievedItems();
                    setRetrievedItems(items);
                } catch (error) {
                    console.error("Failed to fetch retrieved items:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchItems();
        }
    }, [isAuthenticated, authLoading, navigate]);

    // --- UPDATED FUNCTION to call the backend ---
    const handleClaimReward = async () => {
        try {
            const res = await rewardService.claimReward();
            setClaimMessage(res.msg); // Show success message from the backend
            await loadUser(); // Refresh user data to update points total
        } catch (err) {
            setClaimMessage(err.response?.data?.msg || 'An error occurred while claiming.');
        }
    };

    if (authLoading || loading || !user) {
        return <div className="loader">Loading Rewards...</div>;
    }

    const canClaimReward = user.servicePoints >= REWARD_GOAL;

    return (
        <div className="rewards-page-wrapper">
            <div className="rewards-page-container">
                <div className="retrieved-items-list">
                    <h2>{t('rewardsPage.title')}</h2>
                    {retrievedItems.length > 0 ? (
                    <ul>
                        {retrievedItems.map(item => (
                        <li key={item._id} className="retrieved-item">
                            <span className="item-name">{item.itemName}</span>
                            <span className="item-points">+100 {t('rewardsPage.pointsSuffix')}</span>
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <p>{t('rewardsPage.noRetrievals')}</p>
                    )}
                </div>

                <div className="rewards-sidebar">
                    <h3>{t('rewardsPage.sidebarTitle')}</h3>
                    <div className="points-summary">
                        <span className="points-label">{t('rewardsPage.totalPoints')}</span>
                        <span className="points-total">{user.servicePoints}</span>
                    </div>
                    <div className="reward-goal">
                        <p className="goal-title">{t('rewardsPage.nextReward')}</p>
                        <p className="goal-description">{t('rewardsPage.rewardGoal')}</p>
                        <ProgressBar value={user.servicePoints} max={REWARD_GOAL} />
                    </div>

                    <div className="claim-section">
                        {claimMessage ? (
                            <p className="claim-success-message">{claimMessage}</p>
                        ) : canClaimReward ? (
                            <button className="claim-reward-btn" onClick={handleClaimReward}>
                            🎉 {t('rewardsPage.claimButton')}
                            </button>
                        ) : user.servicePoints === 0 ? (
                            <div className="no-rewards-message">
                            <p>{t('rewardsPage.noRewardsYet')}</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RewardsPage;