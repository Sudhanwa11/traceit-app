// client/src/components/items/ItemCard.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import './ItemCard.css';

// The component now accepts 'actionButton' prop for custom buttons
const ItemCard = ({ item, isMatch = false, actionButton }) => {
    const { t } = useTranslation();

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
        <div className={`item-card ${isMatch ? 'match-card' : ''}`}>
            <div className="item-image-placeholder">
                {item.media && item.media.length > 0 ? (
                    <img src={`http://localhost:5000/${item.media[0]}`} alt={item.itemName} className="item-image" />
                ) : (
                    <span>No Image</span>
                )}
            </div>
            <div className="item-card-content">
                <h3>{item.itemName}</h3>
                <p className="item-location">
                    <strong>Location:</strong> {item.location}
                </p>
                <p className="item-description">{item.description}</p>
                
                {/* This section now renders different buttons based on props */}
                <div className="card-action-section">
                    {isMatch && (
                        <div className="similarity-score">
                            <strong>{t('matchesPage.similarity')}</strong> <span>{scorePercentage}%</span>
                        </div>
                    )}
                    {actionButton && (
                        <button className="card-action-btn" onClick={actionButton.onClick}>
                            {actionButton.text}
                        </button>
                    )}
                </div>

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