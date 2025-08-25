import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import authService from '../services/authService';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, isAuthenticated, loading, updateUser, error, loadUser } = useContext(AuthContext);

    // State for modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false);
    
    // State for forms and data
    const [editFormData, setEditFormData] = useState({ name: '', phoneNumber: '', department: '', rollNumber: '', address: '' });
    const [aadhaarFormData, setAadhaarFormData] = useState({ aadharNumber: '', password: '' });
    const [isAadhaarVisible, setIsAadhaarVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [decryptedAadhaar, setDecryptedAadhaar] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [editError, setEditError] = useState('');

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
        if (user) {
            setEditFormData({
                name: user.name || '',
                phoneNumber: user.phoneNumber || '',
                department: user.department || '',
                rollNumber: user.rollNumber || '',
                address: user.address || '',
            });
        }
    }, [isAuthenticated, loading, navigate, user]);
    
    useEffect(() => {
        return () => setDecryptedAadhaar('');
    }, [navigate]);

    const handleOpenEditModal = () => setIsEditModalOpen(true);
    const handleCloseEditModal = () => setIsEditModalOpen(false);
    const onEditFormChange = e => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        handleCloseEditModal();
        setIsConfirmModalOpen(true);
    };
    
    const handleConfirmUpdate = async () => {
        await updateUser(editFormData);
        setIsConfirmModalOpen(false);
        if (error) {
            setEditError(error);
        } else {
            setSuccessMessage(t('profilePage.updateSuccess'));
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const handleOpenAadhaarModal = () => {
        setAadhaarFormData({ aadharNumber: '', password: '' });
        setIsAadhaarVisible(false);
        setIsAadhaarModalOpen(true);
    };

    const handleViewAadhaar = () => {
        setPassword('');
        setIsVerifyModalOpen(true);
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        try {
            const { decryptedAadhaar } = await authService.viewSensitiveData({ password });
            setDecryptedAadhaar(decryptedAadhaar);
            setIsVerifyModalOpen(false);
        } catch (err) {
            alert(err.response?.data?.msg || 'Verification failed');
        }
    };

    const handleAadhaarSubmit = async (e) => {
        e.preventDefault();
        try {
            await authService.updateAadhaar(aadhaarFormData);
            await loadUser();
            setIsAadhaarModalOpen(false);
            setSuccessMessage('Aadhaar details updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            alert(err.response?.data?.msg || 'Update failed');
        }
    };

    if (loading || !user) {
        return <div className="loader">Loading Profile...</div>;
    }

    return (
        <>
            {successMessage && <div className="toast-notification show">{successMessage}</div>}
            
            <div className="profile-container">
                {editError && <div className="error-message page-message">{editError}</div>}
                <div className="profile-card">
                    <div className="profile-header">
                        <h2>{t('profilePage.title')}</h2>
                        <button className="edit-profile-btn" onClick={handleOpenEditModal}>
                            {t('profilePage.editButton')}
                        </button>
                    </div>
                    <div className="profile-details">
                        <div className="info-field"><span className="info-label">{t('profilePage.name')}</span><span className="info-value">{user.name}</span></div>
                        <div className="info-field"><span className="info-label">{t('profilePage.email')}</span><span className="info-value">{user.email}</span></div>
                        <div className="info-field"><span className="info-label">{t('profilePage.rollNumber')}</span><span className="info-value">{user.rollNumber}</span></div>
                        <div className="info-field"><span className="info-label">{t('profilePage.phoneNumber')}</span><span className="info-value">{user.phoneNumber}</span></div>
                        <div className="info-field"><span className="info-label">{t('profilePage.department')}</span><span className="info-value">{user.department}</span></div>
                        <div className="info-field"><span className="info-label">{t('profilePage.address')}</span><span className="info-value">{user.address || 'Not Provided'}</span></div>
                    </div>

                    <div className="verify-section">
                        <h4>{t('profilePage.verifyTitle')}</h4>
                        <p>{t('profilePage.verifySubtitle')}</p>
                        <div className="info-field">
                            <span className="info-label">{t('profilePage.aadhar')}</span>
                            {decryptedAadhaar ? (
                                <span className="info-value">{decryptedAadhaar}</span>
                            ) : (
                                <span className="info-value sensitive">
                                    {user.aadharNumber ? '************' : 'Not Provided'}
                                </span>
                            )}
                        </div>
                        <div className="verify-actions">
                            {user.aadharNumber && <button onClick={handleViewAadhaar} className="btn-secondary">{t('profilePage.viewButton')}</button>}
                            <button onClick={handleOpenAadhaarModal} className="btn-primary">
                                {user.aadharNumber ? t('profilePage.updateAadhaar') : t('profilePage.addAadhaar')}
                            </button>
                        </div>
                    </div>
                    
                    <div className="service-points-section">
                        <h3>{t('profilePage.servicePointsTitle')}</h3>
                        <p className="points-display">{user.servicePoints}</p>
                        <p className="points-description">{t('profilePage.pointsDescription')}</p>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
                <div className="edit-profile-modal">
                    <h2>{t('profilePage.editModalTitle')}</h2>
                    <form onSubmit={handleUpdateSubmit}>
                        <div className="form-group"><label>{t('profilePage.name')}</label><input type="text" name="name" value={editFormData.name} onChange={onEditFormChange} required /></div>
                        <div className="form-group"><label>{t('profilePage.rollNumber')}</label><input type="text" name="rollNumber" value={editFormData.rollNumber} onChange={onEditFormChange} required /></div>
                        <div className="form-group"><label>{t('profilePage.phoneNumber')}</label><input type="tel" name="phoneNumber" value={editFormData.phoneNumber} onChange={onEditFormChange} required /></div>
                        <div className="form-group"><label>{t('profilePage.department')}</label><input type="text" name="department" value={editFormData.department} onChange={onEditFormChange} required /></div>
                        <div className="form-group"><label>{t('profilePage.address')}</label><input type="text" name="address" value={editFormData.address} onChange={onEditFormChange} placeholder="Your Address"/></div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={handleCloseEditModal}>{t('claimModal.cancelButton')}</button>
                            <button type="submit" className="btn-primary">{t('profilePage.saveButton')}</button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
                <div className="confirm-modal-content">
                    <h2>{t('profilePage.confirmTitle')}</h2>
                    <p>{t('profilePage.confirmText')}</p>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={() => setIsConfirmModalOpen(false)}>{t('claimModal.cancelButton')}</button>
                        <button type="button" className="btn-primary" onClick={handleConfirmUpdate}>{t('profilePage.confirmButton')}</button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isAadhaarModalOpen} onClose={() => setIsAadhaarModalOpen(false)}>
                <div className="aadhaar-modal">
                    <h2>{user.aadharNumber ? t('aadhaarModal.updateTitle') : t('aadhaarModal.addTitle')}</h2>
                    <p>{t('aadhaarModal.subtitle')}</p>
                    <form onSubmit={handleAadhaarSubmit}>
                        <div className="form-group">
                            <label>{t('profilePage.aadhar')}</label>
                            <div className="password-input">
                                <input
                                    type={isAadhaarVisible ? 'text' : 'password'}
                                    name="aadharNumber"
                                    value={aadhaarFormData.aadharNumber}
                                    onChange={(e) => setAadhaarFormData({...aadhaarFormData, aadharNumber: e.target.value})}
                                    required
                                />
                                <i className="toggle-vis" onClick={() => setIsAadhaarVisible(!isAadhaarVisible)}>👁️</i>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{t('aadhaarModal.confirmPasswordLabel')}</label>
                            <input
                                type="password"
                                name="password"
                                value={aadhaarFormData.password}
                                onChange={(e) => setAadhaarFormData({...aadhaarFormData, password: e.target.value})}
                                required
                            />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={() => setIsAadhaarModalOpen(false)}>{t('claimModal.cancelButton')}</button>
                            <button type="submit" className="btn-primary">{t('aadhaarModal.saveButton')}</button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)}>
                <div className="verify-modal-content">
                    <h2>{t('verifyModal.title')}</h2>
                    <p>{t('verifyModal.subtitle')}</p>
                    <form onSubmit={handleVerifySubmit}>
                        <div className="form-group">
                            <label>{t('verifyModal.passwordLabel')}</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={() => setIsVerifyModalOpen(false)}>{t('claimModal.cancelButton')}</button>
                            <button type="submit" className="btn-primary">{t('verifyModal.verifyButton')}</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
};

export default ProfilePage;