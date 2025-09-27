// client/src/components/layout/Footer.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="site-footer">
            <p>{t('footer.copyright')}</p>
        </footer>
    );
};

export default Footer;