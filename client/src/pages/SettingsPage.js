import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import authService from '../services/authService';
import './SettingsPage.css';

const SettingsPage = () => {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { logout } = useContext(AuthContext);

    // State for different modals
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
    const [dialog, setDialog] = useState({ isOpen: false, message: '' });

    // State for form data
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [deletePassword, setDeletePassword] = useState('');

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
            }, 2000);
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
            }, 2000);
        } catch (err) {
            setDialog({ isOpen: true, message: err.response.data.msg });
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="settings-container">
            <h2>{t('settings.title')}</h2>

            {/* Language and Appearance Cards remain the same */}
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

            {/* Account Management Card */}
            <div className="settings-card">
                <h3>{t('settings.accountTitle')}</h3>
                <button className="settings-btn" onClick={() => setIsChangePasswordOpen(true)}>{t('settings.changePassword')}</button>
                <button className="settings-btn btn-danger" onClick={() => setIsDeleteAccountOpen(true)}>{t('settings.deleteAccount')}</button>
            </div>
            
            {/* Support Card remains the same */}
            <div className="settings-card">
                <h3>{t('settings.helpTitle')}</h3>
                <button className="settings-btn">{t('settings.help')}</button>
                <button className="settings-btn">{t('settings.feedback')}</button>
            </div>

            {/* --- MODALS --- */}

            {/* Change Password Modal */}
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

            {/* Delete Account Modal */}
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

            {/* Generic Dialog for Success/Error Messages */}
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