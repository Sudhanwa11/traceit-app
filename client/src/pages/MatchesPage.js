import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import itemService from '../services/itemService';
import ItemCard from '../components/items/ItemCard';
import Modal from '../components/common/Modal'; // Import the Modal component
import './MatchesPage.css';

const MatchesPage = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

    const [originalItem, setOriginalItem] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for the claim modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [proof, setProof] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

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
                    setMatches(matchData);
                } catch (error) {
                    console.error("Failed to fetch matches:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchAllData();
        }
    }, [itemId, isAuthenticated, authLoading, navigate]);

    // Handlers for opening and closing the claim modal
    const handleOpenModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
        setProof('');
        setMessage('');
        setError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    // Handler for submitting the claim from the modal
    const handleClaimSubmit = async () => {
        if (!proof) {
            alert('Proof of ownership is required.'); // Simple validation
            return;
        }
        try {
            await itemService.createClaim(selectedItem._id, { proof });
            setMessage(t('claimModal.successMessage'));
            handleCloseModal();
        } catch (err) {
            const errorMessage = err.response?.data?.msg || t('claimModal.errorMessage');
            // Display error as an alert or a message on the page
            alert(errorMessage);
            handleCloseModal();
        }
    };

    if (loading || authLoading) {
        return <div className="loader">Searching for matches with AI...</div>;
    }

    return (
        <div className="matches-page-container">
            {message && <div className="success-message page-message">{message}</div>}
            {error && <div className="error-message page-message">{error}</div>}

            <h2>{t('matchesPage.title')}</h2>
            
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
                                    onClick: () => handleOpenModal(item) // Connect button to open modal
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
            
            {/* The Modal for submitting a claim */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <div className="claim-modal-content">
                    <h2>{t('claimModal.title')}</h2>
                    <p>{t('claimModal.subtitle')}</p>
                    <div className="form-group">
                        <label>{t('claimModal.proofLabel')}</label>
                        <textarea
                            value={proof}
                            onChange={(e) => setProof(e.target.value)}
                            placeholder={t('claimModal.proofPlaceholder')}
                            rows="5"
                        ></textarea>
                    </div>
                    <div className="modal-actions">
                        <button className="btn-secondary" onClick={handleCloseModal}>{t('claimModal.cancelButton')}</button>
                        <button className="btn-primary" onClick={handleClaimSubmit}>{t('claimModal.submitButton')}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MatchesPage;