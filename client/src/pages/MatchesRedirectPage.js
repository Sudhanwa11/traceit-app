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
        // First, wait for the authentication check to be fully complete.
        if (authLoading) {
            return; // Do nothing and wait for the next render.
        }

        // Once the check is done, we can safely see if the user is logged in.
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // If we get here, the user is authenticated. Now we can fetch their items.
        const findLostItemRequests = async () => {
            try {
                const allItems = await itemService.getMyItems();
                const lostItems = allItems.filter(item => item.status === 'Lost' && !item.isRetrieved);

                if (lostItems.length === 1) {
                    // Scenario 1: Exactly one lost item. Redirect to its matches.
                    navigate(`/matches/${lostItems[0]._id}`);
                } else {
                    // Scenario 2: 0 or multiple lost items. Redirect to the query page.
                    navigate('/query');
                }
            } catch (error) {
                console.error("Failed to fetch items for redirect:", error);
                // If there's an error, display a message
                setMessage('Could not fetch your item requests. Please try again from the My Queries page.');
            }
        };

        findLostItemRequests();
        
    }, [isAuthenticated, authLoading, navigate, t]);

    // Show a loading indicator or an error message
    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            {message ? (
                <div className="error-message">{message}</div>
            ) : (
                <div className="loader">Checking for active requests...</div>
            )}
        </div>
    );
};

export default MatchesRedirectPage;