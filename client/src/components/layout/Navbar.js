import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import SmallLogo from '../../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useContext(AuthContext);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const onLogout = () => {
        setDropdownOpen(false);
        logout();
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <header className="site-header">
            {/* --- TOP BAR: Contains Brand and User Menu --- */}
            <div className="top-bar">
                <Link to="/" className="navbar-brand">
                    <img src={SmallLogo} alt="TraceIt Logo" />
                    <h1>TraceIt</h1>
                </Link>

                <div className="navbar-user-info" ref={dropdownRef}>
                    {isAuthenticated && user ? (
                        <>
                            <button className="user-menu-trigger" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                                {user.name} <span className="dropdown-arrow">▼</span>
                            </button>

                            {isDropdownOpen && (
                                <ul className="user-dropdown-menu">
                                    <li><Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>{t('nav.profile')}</Link></li>
                                    <li><Link to="/rewards" className="dropdown-item" onClick={() => setDropdownOpen(false)}>{t('nav.rewards')}</Link></li>
                                    <li><Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>{t('nav.settings')}</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button onClick={onLogout} className="dropdown-item logout">
                                            {t('nav.logout')}
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </>
                    ) : (
                        <div className="top-bar-guest-links">
                             <Link className="nav-link-guest" to="/login">{t('nav.login')}</Link>
                             <Link className="nav-link-guest" to="/register">{t('nav.register')}</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MAIN NAV: Contains Page Links --- */}
            <nav className="main-nav">
                <ul>
                    <li><NavLink className="main-nav-link" to="/" end>{t('nav.home', 'Home')}</NavLink></li>
                    <li><NavLink className="main-nav-link" to="/report">{t('nav.report')}</NavLink></li>
                    <li><NavLink className="main-nav-link" to="/request">{t('nav.request')}</NavLink></li>
                    <li><NavLink className="main-nav-link" to="/query">{t('nav.query', 'My Queries')}</NavLink></li>
                    {isAuthenticated && (
                         <li><NavLink className="main-nav-link" to="/matches">{t('nav.matches')}</NavLink></li>
                    )}
                    <li><NavLink className="main-nav-link" to="/about">{t('nav.about')}</NavLink></li>
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;