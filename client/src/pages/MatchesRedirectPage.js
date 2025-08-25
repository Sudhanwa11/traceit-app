// client/src/pages/MatchesRedirectPage.js
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import itemService from '../services/itemService';

const MatchesRedirectPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        } else if (isAuthenticated) {
            const findLatestRequest = async () => {
                try {
                    const allItems = await itemService.getMyItems();
                    const lostItems = allItems.filter(item => item.status === 'Lost');

                    if (lostItems.length === 1) {
                        // If there's exactly one lost item, go to its matches
                        navigate(`/matches/${lostItems[0]._id}`);
                    } else if (lostItems.length > 1) {
                        // If multiple, go to the query page for the user to choose
                        navigate('/query');
                    } else {
                        // If none, show the message
                        setMessage({
                            title: t('matchesRedirectPage.noRequestsTitle'),
                            info: t('matchesRedirectPage.noRequestsInfo'),
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch user's items:", error);
                } finally {
                    setLoading(false);
                }
            };
            findLatestRequest();
        }
    }, [isAuthenticated, authLoading, navigate, t]);

    if (loading || authLoading) {
        return <div className="loader">Checking for active requests...</div>;
    }

    if (message) {
        return (
            <div className="empty-message-container">
                <div className="empty-message">
                    <h2>{message.title}</h2>
                    <p>{message.info}</p>
                </div>
            </div>
        );
    }

    return null; // Render nothing while redirecting
};

export default MatchesRedirectPage;