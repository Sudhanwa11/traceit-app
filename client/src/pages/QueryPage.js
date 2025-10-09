import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import itemService from '../services/itemService';
import ItemCard from '../components/items/ItemCard';
import Modal from '../components/common/Modal';
import { getSocket } from '../utils/socket';                // ⬅️ NEW
import './QueryPage.css';

function mapStatus(status) {
  switch (status) {
    case 'pending-chat-approval': return { className: 'pending',   label: 'Pending Chat Approval' };
    case 'chat-active':           return { className: 'active',    label: 'Chat Active' };
    case 'resolved-by-reporter':  return { className: 'awaiting',  label: 'Awaiting Claimer Confirmation' };
    case 'retrieval-confirmed':   return { className: 'completed', label: 'Retrieval Confirmed' };
    case 'chat-rejected':         return { className: 'rejected',  label: 'Chat Request Rejected' };
    default:                      return { className: 'unknown',   label: 'Processing' };
  }
}

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
        itemService.getMadeClaims(),
      ]);

      // Hide items that are already involved in claims (same as before)
      const claimedItemIds = [
        ...recClaims.map(c => c.item?._id).filter(Boolean),
        ...mdClaims.map(c => c.item?._id).filter(Boolean),
      ];
      const unclaimedItems = allItems.filter(it => !claimedItemIds.includes(it._id));

      setReportedItems(unclaimedItems.filter(it => it.status === 'Found' && !it.isRetrieved));
      setRequestedItems(unclaimedItems.filter(it => it.status === 'Lost'  && !it.isRetrieved));
      setReceivedClaims(recClaims);
      setMadeClaims(mdClaims);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
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

  /* ---------- LIVE UPDATES VIA SOCKETS ---------- */
  useEffect(() => {
    const socket = getSocket();

    // When any claim changes status (server should emit this)
    const onClaimStatusUpdated = ({ claimId, status, itemId }) => {
      // Update in receivedClaims/madeClaims if present
      setReceivedClaims(prev => prev.map(c => (c._id === claimId ? { ...c, status } : c)));
      setMadeClaims(prev => prev.map(c => (c._id === claimId ? { ...c, status } : c)));

      // If retrieval confirmed, reflect on item lists immediately
      if (status === 'retrieval-confirmed' && itemId) {
        setReportedItems(prev => prev.filter(it => String(it._id) !== String(itemId)));
        setRequestedItems(prev => prev.filter(it => String(it._id) !== String(itemId)));
      }
    };

    // When an item is marked retrieved (e.g., claimer confirmed)
    const onItemRetrieved = ({ itemId }) => {
      setReportedItems(prev => prev.filter(it => String(it._id) !== String(itemId)));
      setRequestedItems(prev => prev.filter(it => String(it._id) !== String(itemId)));
    };

    socket.on('claimStatusUpdated', onClaimStatusUpdated);
    socket.on('itemRetrieved', onItemRetrieved);
    return () => {
      socket.off('claimStatusUpdated', onClaimStatusUpdated);
      socket.off('itemRetrieved', onItemRetrieved);
    };
  }, []);

  /* ---------- ACTIONS (with light optimistic updates) ---------- */
  const handleClaimResponse = async (claimId, response) => {
    // optimistic: flip local state immediately
    if (response === 'accept') {
      setReceivedClaims(prev => prev.map(c => (c._id === claimId ? { ...c, status: 'chat-active' } : c)));
    } else {
      setReceivedClaims(prev => prev.map(c => (c._id === claimId ? { ...c, status: 'chat-rejected' } : c)));
    }

    try {
      await itemService.respondToChatRequest(claimId, response);
      if (response === 'accept') navigate(`/chat/${claimId}`);
    } catch (error) {
      console.error('Failed to respond to claim:', error);
      // rollback by refetch
      fetchAllData();
      alert('Error responding to claim.');
    }
  };

  const handleResolveClaim = async (claimId) => {
    // optimistic
    setReceivedClaims(prev => prev.map(c => (c._id === claimId ? { ...c, status: 'resolved-by-reporter' } : c)));
    try {
      await itemService.reporterResolveClaim(claimId);
    } catch (error) {
      console.error('Error resolving claim:', error);
      fetchAllData();
    }
  };

  const handleConfirmRetrieval = async (claimId) => {
    // optimistic
    setMadeClaims(prev => prev.map(c => (c._id === claimId ? { ...c, status: 'retrieval-confirmed' } : c)));

    try {
      const updated = await itemService.claimerConfirmRetrieval(claimId);
      // Ensure lists reflect removal of the retrieved item
      const itemId = updated?.item || madeClaims.find(c => c._id === claimId)?.item?._id;
      if (itemId) {
        setReportedItems(prev => prev.filter(it => String(it._id) !== String(itemId)));
        setRequestedItems(prev => prev.filter(it => String(it._id) !== String(itemId)));
      }
      await loadUser();
    } catch (error) {
      console.error('Error confirming retrieval:', error);
      fetchAllData();
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
      setReportedItems(prev => prev.filter(it => it._id !== itemToDelete._id));
      setRequestedItems(prev => prev.filter(it => it._id !== itemToDelete._id));
      setShowConfirmModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Error deleting item.');
    }
  };

  if (authLoading || loading) {
    return <div className="loader">{t('queryPage.loadingQueries', 'Loading your queries...')}</div>;
  }

  return (
    <div className="query-page-container">
      <h2>{t('queryPage.title', 'My Queries & Claims')}</h2>

      {/* Claims received on my items */}
      <section className="query-section">
        <h3>{t('queryPage.claimsReceivedTitle', 'Claims on My Items')}</h3>
        <div className="claims-list">
          {receivedClaims.length > 0 ? (
            receivedClaims.map((claim) => {
              const status = mapStatus(claim.status);
              return (
                <div key={claim._id} className={`claim-card status-${status.className}`}>
                  <h4>
                    {t('queryPage.claimOn', 'Claim on:')}{' '}
                    {claim.item?.itemName || t('common.unnamedItem', 'Unnamed Item')}
                  </h4>

                  <p>
                    <strong>{t('queryPage.chatRequestFrom', 'Chat request from')}</strong>{' '}
                    {claim.claimer?.name || t('common.anonymous', 'Anonymous')}
                    {claim.claimer?.department ? ` (${claim.claimer.department})` : ''}
                  </p>

                  <div className="claim-footer">
                    <span className="status-badge">{status.label}</span>

                    <div className="action-buttons">
                      {claim.status === 'pending-chat-approval' && (
                        <>
                          <button className="btn-approve" onClick={() => handleClaimResponse(claim._id, 'accept')}>
                            {t('queryPage.acceptChat', 'Approve Chat')}
                          </button>
                          <button className="btn-reject" onClick={() => handleClaimResponse(claim._id, 'reject')}>
                            {t('queryPage.rejectChat', 'Reject')}
                          </button>
                        </>
                      )}

                      {claim.status === 'chat-active' && (
                        <>
                          <button className="btn-chat" onClick={() => navigate(`/chat/${claim._id}`)}>
                            {t('queryPage.chatWithClaimer', 'Open Chat')}
                          </button>
                          <button className="btn-primary" onClick={() => handleResolveClaim(claim._id)}>
                            {t('queryPage.markAsResolved', 'Mark as Resolved')}
                          </button>
                        </>
                      )}

                      {claim.status === 'resolved-by-reporter' && (
                        <p className="status-message">
                          {t('queryPage.waitingForClaimerConfirmation', 'Waiting for claimer to confirm retrieval...')}
                        </p>
                      )}

                      {claim.status === 'retrieval-confirmed' && (
                        <p className="status-message success">
                          {t('queryPage.retrievalConfirmed', 'Retrieval confirmed. Nice!')}
                        </p>
                      )}

                      {claim.status === 'chat-rejected' && (
                        <p className="status-message error">
                          {t('queryPage.chatRejectedShort', 'Chat request rejected.')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="empty-message">
              {t('queryPage.noClaimsReceived', 'No claims have been made on your items yet.')}
            </p>
          )}
        </div>
      </section>

      {/* Claims I made on other items */}
      <section className="query-section">
        <h3>{t('queryPage.madeClaimsTitle', 'My Claims on Other Items')}</h3>
        <div className="claims-list">
          {madeClaims.length > 0 ? (
            madeClaims.map((claim) => {
              const status = mapStatus(claim.status);
              return (
                <div key={claim._id} className={`claim-card status-${status.className}`}>
                  <h4>
                    {t('queryPage.yourClaimOn', 'Your Claim on:')}{' '}
                    {claim.item?.itemName || t('common.unnamedItem', 'Unnamed Item')}
                  </h4>

                  <p>
                    <strong>{t('queryPage.reporter', 'Reported By')}:</strong>{' '}
                    {claim.itemReporter?.name || t('common.anonymous', 'Anonymous')}
                  </p>

                  <div className="claim-footer">
                    <span className="status-badge">{status.label}</span>

                    <div className="action-buttons">
                      {claim.status === 'pending-chat-approval' && (
                        <p className="status-message">
                          {t('queryPage.waitingForReporterApproval', 'Waiting for reporter to approve chat...')}
                        </p>
                      )}

                      {claim.status === 'chat-active' && (
                        <button className="btn-chat" onClick={() => navigate(`/chat/${claim._id}`)}>
                          {t('queryPage.chatWithReporter', 'Open Chat')}
                        </button>
                      )}

                      {claim.status === 'resolved-by-reporter' && (
                        <button className="btn-primary" onClick={() => handleConfirmRetrieval(claim._id)}>
                          {t('queryPage.confirmRetrieval', 'Confirm Retrieval')}
                        </button>
                      )}

                      {claim.status === 'retrieval-confirmed' && (
                        <p className="status-message success">
                          {t('queryPage.retrievalConfirmed', 'Retrieval confirmed. Thank you!')}
                        </p>
                      )}

                      {claim.status === 'chat-rejected' && (
                        <p className="status-message error">
                          {t('queryPage.chatRejectedShort', 'Chat request rejected.')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="empty-message">
              {t('queryPage.noMadeClaims', 'You have not made any claims yet.')}
            </p>
          )}
        </div>
      </section>

      {/* Other posts by me (not part of any claim) */}
      <section className="query-section">
        <h3>{t('queryPage.otherPostsTitle', 'My Other Item Posts')}</h3>
        <div className="items-grid">
          {[...reportedItems, ...requestedItems].length > 0 ? (
            [...reportedItems, ...requestedItems].map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                menuOptions={[
                  ...(item.status === 'Lost'
                    ? [{ text: t('queryPage.findMatchesButton', 'View Matches'), onClick: () => navigate(`/matches/${item._id}`) }]
                    : []),
                  { text: t('queryPage.deleteButton', 'Delete'), onClick: () => handleOpenConfirmModal(item), className: 'delete-option' },
                ]}
              />
            ))
          ) : (
            <p className="empty-message">{t('queryPage.noOtherPosts', 'You have no other posts yet.')}</p>
          )}
        </div>
      </section>

      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <div className="confirm-modal-content">
          <h2>{t('queryPage.confirmDeleteTitle', 'Delete this post?')}</h2>
          <p>
            {t('queryPage.confirmDeleteText', {
              itemName: itemToDelete?.itemName || t('common.thisItem', 'this item'),
            })}
          </p>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>
              {t('queryPage.cancelButton', 'Cancel')}
            </button>
            <button className="btn-danger" onClick={handleDeleteItem}>
              {t('queryPage.confirmButton', 'Delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QueryPage;
