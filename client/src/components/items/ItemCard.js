import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './ItemCard.css';

const ItemCard = ({ item, isMatch = false, actionButton, menuOptions = [] }) => {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const formatDate = (dateString) => {
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (error) {
            return "Invalid Date";
        }
    };

    const scorePercentage = item.score ? (item.score * 100).toFixed(1) : 0;

    return (
        <div className="item-card">
            {menuOptions.length > 0 && (
                <div className="options-menu-container" ref={menuRef}>
                    <button className="options-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        ⋮
                    </button>
                    {isMenuOpen && (
                        <ul className="options-menu">
                            {menuOptions.map((option, index) => (
                                <li key={index} className={option.className || ''} onClick={() => {
                                    option.onClick();
                                    setIsMenuOpen(false);
                                }}>
                                    {option.text}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            
            <div className="item-image-placeholder">
                {item.media && item.media.length > 0 ? (
                    <img src={`http://localhost:5000/api/files/${item.media[0].filename}`} alt={item.itemName} className="item-image" />
                ) : (
                    <span>No Image</span>
                )}
            </div>
            <div className="item-card-content">
                <h3>{item.itemName}</h3>
                <p className="item-location"><strong>Location:</strong> {item.location}</p>
                <p className="item-description">{item.description}</p>
                
                {actionButton && (
                    <div className="card-action-section">
                        {isMatch && (
                            <div className="similarity-score">
                                <strong>{t('matchesPage.similarity')}</strong> <span>{scorePercentage}%</span>
                            </div>
                        )}
                        <button className={`card-action-btn ${actionButton.className || ''}`} onClick={actionButton.onClick}>
                            {actionButton.text}
                        </button>
                    </div>
                )}

                <div className="item-card-footer">
                    <span className="item-category">{item.subCategory}</span>
                    <span className="item-date">
                        {item.status === 'Found' ? 'Found on:' : 'Lost on:'} {formatDate(item.createdAt)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;