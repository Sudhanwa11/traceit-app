import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import itemService from '../services/itemService';
import ItemCard from '../components/items/ItemCard';
import './QueryPage.css';

const QueryPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isAuthenticated, loading: authLoading, loadUser } = useContext(AuthContext);

    const [reportedItems, setReportedItems] = useState([]);
    const [requestedItems, setRequestedItems] = useState([]);
    const [receivedClaims, setReceivedClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        } else if (isAuthenticated) {
            const fetchAllData = async () => {
                try {
                    const [allItems, claims] = await Promise.all([
                        itemService.getMyItems(),
                        itemService.getReceivedClaims()
                    ]);
                    
                    setReportedItems(allItems.filter(item => item.status === 'Found'));
                    setRequestedItems(allItems.filter(item => item.status === 'Lost'));
                    setReceivedClaims(claims);
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchAllData();
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleClaimResponse = async (claimId, response) => {
        try {
            const updatedClaim = await itemService.respondToClaim(claimId, { response });
            setReceivedClaims(prevClaims => 
                prevClaims.map(claim => claim._id === claimId ? updatedClaim : claim)
            );
            if (response === 'approve') {
                loadUser();
            }
        } catch (error) {
            console.error("Failed to respond to claim:", error);
            alert("Error responding to claim.");
        }
    };

    if (authLoading || loading) {
        return <div className="loader">Loading your queries...</div>;
    }

    return (
        <div className="query-page-container">
            <h2>{t('queryPage.title')}</h2>
            
            <section className="query-section">
                <h3>{t('queryPage.claimsReceivedTitle')}</h3>
                <div className="claims-list">
                    {receivedClaims.length > 0 ? (
                        receivedClaims.map(claim => (
                            <div key={claim._id} className={`claim-card status-${claim.status}`}>
                                <h4>{claim.item.itemName}</h4>
                                <p><strong>{t('queryPage.claimedBy')}</strong> {claim.claimer.name} ({claim.claimer.department})</p>
                                <p><strong>{t('queryPage.proofProvided')}</strong></p>
                                <p className="proof-text">"{claim.proof}"</p>
                                <div className="claim-footer">
                                    <span className="status-badge">{claim.status}</span>
                                    {claim.status === 'pending' && (
                                        <div className="action-buttons">
                                            <button className="btn-approve" onClick={() => handleClaimResponse(claim._id, 'approve')}>
                                                {t('queryPage.approveButton')}
                                            </button>
                                            <button className="btn-reject" onClick={() => handleClaimResponse(claim._id, 'reject')}>
                                                {t('queryPage.rejectButton')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="empty-message">{t('queryPage.noClaims')}</p>
                    )}
                </div>
            </section>
            
            <section className="query-section">
                <h3>{t('queryPage.reportedTitle')}</h3>
                {/* --- CONTENT FOR REPORTED ITEMS --- */}
                <div className="items-grid">
                    {reportedItems.length > 0 ? (
                        reportedItems.map(item => <ItemCard key={item._id} item={item} />)
                    ) : (
                        <p className="empty-message">{t('queryPage.noReported')}</p>
                    )}
                </div>
            </section>

            <section className="query-section">
                <h3>{t('queryPage.requestedTitle')}</h3>
                {/* --- CONTENT FOR REQUESTED ITEMS --- */}
                <div className="items-grid">
                    {requestedItems.length > 0 ? (
                        requestedItems.map(item => (
                            <ItemCard 
                                key={item._id} 
                                item={item}
                                actionButton={{
                                    text: 'Find Matches',
                                    onClick: () => navigate(`/matches/${item._id}`)
                                }}
                            />
                        ))
                    ) : (
                        <p className="empty-message">{t('queryPage.noRequested')}</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default QueryPage;