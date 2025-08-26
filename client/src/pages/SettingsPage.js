import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import authService from '../services/authService'; // you must have this with changePassword, deleteAccount methods
import './SettingsPage.css';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  // States for dialogs and form data
  const [showChangePwdForm, setShowChangePwdForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handlers for opening dialogs
  const onChangePasswordClick = () => {
    setShowChangePwdForm(true);
  };

  const onDeleteAccountClick = () => {
    setConfirmAction('deleteAccount');
    setShowConfirmDialog(true);
  };

  // Form submit for change password, opens confirmation dialog
  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setConfirmAction('changePassword');
    setShowChangePwdForm(false);
    setShowConfirmDialog(true);
  };

  // Confirm dialog Yes clicked
  const onConfirm = async () => {
    setActionInProgress(true);
    try {
      if (confirmAction === 'changePassword') {
        await authService.changePassword({ newPassword });
        alert('Password changed successfully.');
        setNewPassword('');
        setConfirmPassword('');
      } else if (confirmAction === 'deleteAccount') {
        await authService.deleteAccount();
        alert('Account deleted successfully.');
        // TODO: Add logout or redirect logic here
      }
    } catch (error) {
      alert(error.response?.data?.msg || 'An error occurred.');
    } finally {
      setShowConfirmDialog(false);
      setActionInProgress(false);
      setConfirmAction(null);
    }
  };

  // Confirm dialog No clicked
  const onCancelConfirm = () => {
    setShowConfirmDialog(false);
    if (confirmAction === 'changePassword') {
      setShowChangePwdForm(true); // reopen form if cancelling on confirm
    }
    setConfirmAction(null);
  };

  // Language change handler
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="settings-container">
      <h2>{t('settings.title')}</h2>

      {/* --- Language Section --- */}
      <div className="settings-card">
        <h3>{t('settings.languageTitle')}</h3>
        <p>{t('settings.languageDesc')}</p>
        <div className="language-buttons">
          <button 
            className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
            onClick={() => changeLanguage('en')}
          >
            English
          </button>
          <button 
            className={`lang-btn ${i18n.language === 'hi' ? 'active' : ''}`}
            onClick={() => changeLanguage('hi')}
          >
            हिन्दी (Hindi)
          </button>
        </div>
      </div>

      {/* --- Dark Mode Section --- */}
      <div className="settings-card">
        <h3>{t('settings.darkModeTitle')}</h3>
        <p>{t('settings.darkModeDesc')}</p>
        <div className="toggle-switch-container">
          <span>Light</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={theme === 'dark'} 
              onChange={toggleTheme} 
            />
            <span className="slider"></span>
          </label>
          <span>Dark</span>
        </div>
      </div>

      {/* --- Account Management Section --- */}
      <div className="settings-card">
        <h3>{t('settings.accountTitle')}</h3>
        <button className="settings-btn" onClick={onChangePasswordClick}>
          {t('settings.changePassword')}
        </button>
        <button className="settings-btn btn-danger" onClick={onDeleteAccountClick}>
          {t('settings.deleteAccount')}
        </button>
      </div>

      {/* --- Support Section --- */}
      <div className="settings-card">
        <h3>{t('settings.helpTitle')}</h3>
        <button className="settings-btn">{t('settings.help')}</button>
        <button className="settings-btn">{t('settings.feedback')}</button>
      </div>

      {/* --- Change Password Form Dialog --- */}
      {showChangePwdForm && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>{t('settings.changePassword')}</h3>
            <form onSubmit={handleChangePasswordSubmit}>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <div className="dialog-actions">
                <button type="submit" className="btn-confirm" disabled={actionInProgress}>Submit</button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowChangePwdForm(false)}
                  disabled={actionInProgress}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Confirmation Dialog --- */}
      {showConfirmDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <p>
              {confirmAction === 'changePassword' 
                ? 'Are you sure you want to change your password?' 
                : 'Are you sure you want to delete your account? This action cannot be undone.'}
            </p>
            <button onClick={onConfirm} className="btn-confirm" disabled={actionInProgress}>Yes</button>
            <button onClick={onCancelConfirm} className="btn-cancel" disabled={actionInProgress}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
