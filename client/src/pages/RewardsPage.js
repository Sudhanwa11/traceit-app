// client/src/pages/RewardsPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Import the hook
import { AuthContext } from '../context/AuthContext';
import itemService from '../services/itemService';
import ProgressBar from '../components/rewards/ProgressBar';
import './RewardsPage.css';

const RewardsPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(); // 2. Initialize the hook
    const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
    const [retrievedItems, setRetrievedItems] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (authLoading || loading || !user) {
        return <div className="loader">Loading Rewards...</div>;
    }
    
    const REWARD_GOAL = 2000;

    // 3. Use the t() function for all text content
    return (
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
                 {user.servicePoints === 0 && (
                    <div className="no-rewards-message">
                        <p>{t('rewardsPage.noRewardsYet')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RewardsPage;