import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import itemService from '../services/itemService';
import ItemCard from '../components/items/ItemCard';
import Modal from '../components/common/Modal';
import './QueryPage.css';

const QueryPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isAuthenticated, loading: authLoading, loadUser } = useContext(AuthContext);

    const [reportedItems, setReportedItems] = useState([]);
    const [requestedItems, setRequestedItems] = useState([]);
    const [receivedClaims, setReceivedClaims] = useState([]);
    const [madeClaims, setMadeClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchAllData = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const [allItems, recClaims, mdClaims] = await Promise.all([
                itemService.getMyItems(),
                itemService.getReceivedClaims(),
                itemService.getMadeClaims()
            ]);
            
            const claimedItemIds = [...recClaims.map(c => c.item._id), ...mdClaims.map(c => c.item._id)];
            const unclaimedItems = allItems.filter(item => !claimedItemIds.includes(item._id));

            setReportedItems(unclaimedItems.filter(item => item.status === 'Found'));
            setRequestedItems(unclaimedItems.filter(item => item.status === 'Lost'));
            setReceivedClaims(recClaims);
            setMadeClaims(mdClaims);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        } else if (isAuthenticated) {
            fetchAllData();
        }
    }, [isAuthenticated, authLoading, navigate, fetchAllData]);

    const handleClaimResponse = async (claimId, response) => {
        try {
            await itemService.respondToChatRequest(claimId, response);
            if (response === 'accept') {
                navigate(`/chat/${claimId}`);
            } else {
                fetchAllData();
            }
        } catch (error) {
            console.error("Failed to respond to claim:", error);
            alert("Error responding to claim.");
        }
    };
    
    const handleResolveClaim = async (claimId) => {
        try {
            await itemService.reporterResolveClaim(claimId);
            fetchAllData();
        } catch (error) {
            console.error("Error resolving claim:", error);
        }
    };

    const handleConfirmRetrieval = async (claimId) => {
        try {
            await itemService.claimerConfirmRetrieval(claimId);
            await loadUser();
            fetchAllData();
        } catch (error) {
            console.error("Error confirming retrieval:", error);
        }
    };

    const handleOpenConfirmModal = (item) => {
        setItemToDelete(item);
        setShowConfirmModal(true);
    };

    const handleDeleteItem = async () => {
        if (!itemToDelete) return;
        try {
            await itemService.deleteItem(itemToDelete._id);
            fetchAllData();
            setShowConfirmModal(false);
            setItemToDelete(null);
        } catch (error) {
            console.error("Failed to delete item:", error);
            alert("Error deleting item.");
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
                                <h4>{t('queryPage.claimOn')} {claim.item.itemName}</h4>
                                <p><strong>{t('queryPage.chatRequestFrom')}</strong> {claim.claimer.name} ({claim.claimer.department})</p>
                                <div className="claim-footer">
                                    <span className="status-badge">{claim.status.replace(/-/g, ' ')}</span>
                                    <div className="action-buttons">
                                        {claim.status === 'pending-chat-approval' && (
                                            <>
                                                <button className="btn-approve" onClick={() => handleClaimResponse(claim._id, 'accept')}>{t('queryPage.acceptChat')}</button>
                                                <button className="btn-reject" onClick={() => handleClaimResponse(claim._id, 'reject')}>{t('queryPage.rejectChat')}</button>
                                            </>
                                        )}
                                        {claim.status === 'chat-active' && (
                                            <>
                                                <button className="btn-chat" onClick={() => navigate(`/chat/${claim._id}`)}>{t('queryPage.chatWithClaimer')}</button>
                                                <button className="btn-primary" onClick={() => handleResolveClaim(claim._id)}>{t('queryPage.markAsResolved')}</button>
                                            </>
                                        )}
                                        {claim.status === 'resolved-by-reporter' && <p className="status-message">{t('queryPage.waitingForClaimerConfirmation')}</p>}
                                        {claim.status === 'retrieval-confirmed' && <p className="status-message success">{t('queryPage.retrievalConfirmed')}</p>}
                                        {claim.status === 'chat-rejected' && <p className="status-message error">{t('queryPage.chatRejectedShort')}</p>}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : <p className="empty-message">{t('queryPage.noClaimsReceived')}</p>}
                </div>
            </section>
            
            <section className="query-section">
                <h3>{t('queryPage.madeClaimsTitle')}</h3>
                <div className="claims-list">
                    {madeClaims.length > 0 ? (
                        madeClaims.map(claim => (
                            <div key={claim._id} className={`claim-card status-${claim.status}`}>
                                <h4>{t('queryPage.yourClaimOn')} {claim.item.itemName}</h4>
                                <p><strong>{t('queryPage.reporter')}:</strong> {claim.itemReporter.name}</p>
                                <div className="claim-footer">
                                    <span className="status-badge">{claim.status.replace(/-/g, ' ')}</span>
                                    <div className="action-buttons">
                                        {claim.status === 'pending-chat-approval' && <p className="status-message">{t('queryPage.waitingForReporterApproval')}</p>}
                                        {claim.status === 'chat-active' && <button className="btn-chat" onClick={() => navigate(`/chat/${claim._id}`)}>{t('queryPage.chatWithReporter')}</button>}
                                        {claim.status === 'resolved-by-reporter' && <button className="btn-primary" onClick={() => handleConfirmRetrieval(claim._id)}>{t('queryPage.confirmRetrieval')}</button>}
                                        {claim.status === 'retrieval-confirmed' && <p className="status-message success">{t('queryPage.retrievalConfirmed')}</p>}
                                        {claim.status === 'chat-rejected' && <p className="status-message error">{t('queryPage.chatRejectedShort')}</p>}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : <p className="empty-message">{t('queryPage.noMadeClaims')}</p>}
                </div>
            </section>

            <section className="query-section">
                <h3>{t('queryPage.otherPostsTitle')}</h3>
                <div className="items-grid">
                    {[...reportedItems, ...requestedItems].length > 0 ? (
                        [...reportedItems, ...requestedItems].map(item => (
                            <ItemCard 
                                key={item._id} 
                                item={item}
                                menuOptions={[
                                    ...(item.status === 'Lost' ? [{ text: t('queryPage.findMatchesButton'), onClick: () => navigate(`/matches/${item._id}`) }] : []),
                                    { text: t('queryPage.deleteButton'), onClick: () => handleOpenConfirmModal(item), className: 'delete-option' }
                                ]}
                            />
                        ))
                    ) : <p className="empty-message">{t('queryPage.noOtherPosts')}</p>}
                </div>
            </section>

            <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
                <div className="confirm-modal-content">
                    <h2>{t('queryPage.confirmDeleteTitle')}</h2>
                    <p>{t('queryPage.confirmDeleteText', { itemName: itemToDelete?.itemName })}</p>
                    <div className="modal-actions">
                        <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>{t('queryPage.cancelButton')}</button>
                        <button className="btn-danger" onClick={handleDeleteItem}>{t('queryPage.confirmButton')}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default QueryPage;