import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import the hook
import { AuthContext } from '../context/AuthContext';
import './AuthForm.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(); // Initialize the hook
    const { login, isAuthenticated, error } = useContext(AuthContext);

    // ... (keep existing state and handlers: formData, formError, onChange, onSubmit)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    
    const [formError, setFormError] = useState('');
    const { email, password } = formData;

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);
    
    useEffect(() => {
        if (error) {
            setFormError(error);
        }
    }, [error]);

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await login({ email, password });
        } catch (err) {
            console.error(err.message);
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="auth-container">
            <div className="auth-form-wrapper">
                <button onClick={toggleLanguage} className="lang-toggle-btn">
                    {i18n.language === 'en' ? 'हिन्दी' : 'English'}
                </button>
                <h2>{t('loginPage.title')}</h2>
                <p>{t('loginPage.subtitle')}</p>
                {formError && <div className="error-message">{formError}</div>}
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>{t('loginPage.collegeEmail')}</label>
                        <input type="email" name="email" value={email} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('loginPage.password')}</label>
                        <input type="password" name="password" value={password} onChange={onChange} required />
                    </div>
                    <button type="submit" className="btn-submit">{t('loginPage.loginButton')}</button>
                </form>
                <p className="auth-switch-link">
                    {t('loginPage.switchText')}{' '}
                    <Link to="/register">{t('loginPage.switchLink')}</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;