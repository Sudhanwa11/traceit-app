import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import the hook
import { AuthContext } from '../context/AuthContext';
import './AuthForm.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(); // Initialize the hook
    const { register, isAuthenticated, error } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rollNumber: '',
        phoneNumber: '',
        department: '',
        password: '',
        password2: ''
    });

    // ... (keep existing state and handlers: formError, onChange, onSubmit)
    const [formError, setFormError] = useState('');
    const { name, email, rollNumber, phoneNumber, department, password, password2 } = formData;

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
        if (password !== password2) {
            setFormError('Passwords do not match'); // This can also be translated
            return;
        }
        try {
            await register({ name, email, rollNumber, phoneNumber, department, password });
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
                <h2>{t('registerPage.title')}</h2>
                <p>{t('registerPage.subtitle')}</p>
                {formError && <div className="error-message">{formError}</div>}
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>{t('registerPage.fullName')}</label>
                        <input type="text" name="name" value={name} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('registerPage.collegeEmail')}</label>
                        <input type="email" name="email" value={email} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('registerPage.rollNumber')}</label>
                        <input type="text" name="rollNumber" value={rollNumber} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('registerPage.phoneNumber')}</label>
                        <input type="tel" name="phoneNumber" value={phoneNumber} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('registerPage.department')}</label>
                        <input type="text" name="department" value={department} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('registerPage.password')}</label>
                        <input type="password" name="password" value={password} onChange={onChange} required minLength="6" />
                    </div>
                    <div className="form-group">
                        <label>{t('registerPage.confirmPassword')}</label>
                        <input type="password" name="password2" value={password2} onChange={onChange} required minLength="6" />
                    </div>
                    <button type="submit" className="btn-submit">{t('registerPage.registerButton')}</button>
                </form>
                <p className="auth-switch-link">
                    {t('registerPage.switchText')}{' '}
                    <Link to="/login">{t('registerPage.switchLink')}</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;