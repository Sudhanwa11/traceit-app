import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import itemService from '../services/itemService';

const MatchesRedirectPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (authLoading) return; // wait until auth check is done

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const findLostItemRequests = async () => {
            try {
                const allItems = await itemService.getMyItems();
                const lostItems = allItems.filter(
                    item => item.status === 'Lost' && !item.isRetrieved
                );

                if (lostItems.length === 1) {
                    // ✅ Exactly one lost item → go directly to its matches page
                    navigate(`/matches/${lostItems[0]._id}`);
                } else {
                    // ✅ 0 or multiple lost items → stay on the general matches page
                    navigate('/matches/all');
                }
            } catch (error) {
                console.error("Failed to fetch items for redirect:", error);
                setMessage('Could not fetch your item requests. Please try again.');
                // fallback to general matches page
                navigate('/matches/all');
            }
        };

        findLostItemRequests();
    }, [isAuthenticated, authLoading, navigate, t]);

    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            {message ? (
                <div className="error-message">{message}</div>
            ) : (
                <div className="loader">Checking your requests...</div>
            )}
        </div>
    );
};

export default MatchesRedirectPage;
