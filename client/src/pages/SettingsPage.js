import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import authService from '../services/authService';
import feedbackService from '../services/feedbackService'; // Import the new service
import './SettingsPage.css';

const SettingsPage = () => {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // State for modals
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [dialog, setDialog] = useState({ isOpen: false, message: '' });

    // State for forms
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [deletePassword, setDeletePassword] = useState('');
    const [feedbackData, setFeedbackData] = useState({ name: '', email: '', message: '' });

    const handlePasswordFormChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleChangePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setDialog({ isOpen: true, message: 'New passwords do not match.' });
        }
        try {
            const res = await authService.changePassword(passwordData);
            setIsChangePasswordOpen(false);
            setDialog({ isOpen: true, message: res.msg });
            setTimeout(() => {
                setDialog({ isOpen: false, message: '' });
                logout();
            }, 3000);
        } catch (err) {
            setDialog({ isOpen: true, message: err.response.data.msg });
        }
    };

    const handleDeleteAccountSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await authService.deleteAccount({ password: deletePassword });
            setIsDeleteAccountOpen(false);
            setDialog({ isOpen: true, message: res.msg });
            setTimeout(() => {
                setDialog({ isOpen: false, message: '' });
                logout();
            }, 3000);
        } catch (err) {
            setDialog({ isOpen: true, message: err.response.data.msg });
        }
    };
    
    // Pre-fill feedback form when modal opens
    const handleOpenFeedbackModal = () => {
        if (user) {
            setFeedbackData({ name: user.name, email: user.email, message: '' });
        }
        setIsFeedbackOpen(true);
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await feedbackService.submitFeedback(feedbackData);
            setIsFeedbackOpen(false);
            setDialog({ isOpen: true, message: res.msg });
        } catch (err) {
            setDialog({ isOpen: true, message: 'Failed to submit feedback.' });
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="settings-container">
            <h2>{t('settings.title')}</h2>

            <div className="settings-card">
                <h3>{t('settings.languageTitle')}</h3>
                <p>{t('settings.languageDesc')}</p>
                <div className="language-buttons">
                    <button className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`} onClick={() => changeLanguage('en')}>English</button>
                    <button className={`lang-btn ${i18n.language === 'hi' ? 'active' : ''}`} onClick={() => changeLanguage('hi')}>हिन्दी (Hindi)</button>
                </div>
            </div>

            <div className="settings-card">
                <h3>{t('settings.darkModeTitle')}</h3>
                <p>{t('settings.darkModeDesc')}</p>
                <div className="toggle-switch-container">
                    <span>Light</span>
                    <label className="toggle-switch"><input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} /><span className="slider"></span></label>
                    <span>Dark</span>
                </div>
            </div>

            <div className="settings-card">
                <h3>{t('settings.accountTitle')}</h3>
                <button className="settings-btn" onClick={() => setIsChangePasswordOpen(true)}>{t('settings.changePassword')}</button>
                <button className="settings-btn btn-danger" onClick={() => setIsDeleteAccountOpen(true)}>{t('settings.deleteAccount')}</button>
            </div>
            
            <div className="settings-card">
                <h3>{t('settings.helpTitle')}</h3>
                <button className="settings-btn" onClick={() => navigate('/help')}>{t('settings.help')}</button>
                <button className="settings-btn" onClick={handleOpenFeedbackModal}>{t('settings.feedback')}</button>
            </div>

            {/* --- MODALS --- */}
            <Modal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)}>
                <form onSubmit={handleChangePasswordSubmit} className="modal-form">
                    <h2>{t('settings.changePassword')}</h2>
                    <div className="form-group">
                        <label>Old Password</label>
                        <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordFormChange} required />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordFormChange} required minLength="6" />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordFormChange} required minLength="6" />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={() => setIsChangePasswordOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Changes</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDeleteAccountOpen} onClose={() => setIsDeleteAccountOpen(false)}>
                <form onSubmit={handleDeleteAccountSubmit} className="modal-form">
                    <h2>Delete Account</h2>
                    <p>This action cannot be undone. To confirm, please enter your password.</p>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={() => setIsDeleteAccountOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-danger">Delete My Account</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)}>
                <form onSubmit={handleFeedbackSubmit} className="modal-form">
                    <h2>{t('feedbackModal.title')}</h2>
                    <div className="form-group">
                        <label>{t('feedbackModal.yourMessage')}</label>
                        <textarea
                            value={feedbackData.message}
                            onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                            rows="6"
                            placeholder={t('feedbackModal.placeholder')}
                            required
                        ></textarea>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={() => setIsFeedbackOpen(false)}>{t('feedbackModal.cancelButton')}</button>
                        <button type="submit" className="btn-primary">{t('feedbackModal.submitButton')}</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={dialog.isOpen} onClose={() => setDialog({ isOpen: false, message: '' })}>
                <div className="dialog-content">
                    <p>{dialog.message}</p>
                    <div className="modal-actions" style={{ justifyContent: 'center' }}>
                        <button className="btn-primary" onClick={() => setDialog({ isOpen: false, message: '' })}>OK</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SettingsPage;