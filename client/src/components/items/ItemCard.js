import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './ItemCard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ItemCard = ({
  item,
  isMatch = false,
  actionButton,
  menuOptions = [],
}) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (evt) => {
      if (menuRef.current && !menuRef.current.contains(evt.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return t('common.invalidDate', 'Invalid Date');
    }
  };

  // score is expected 0..1 from the server
  const hasNumericScore = typeof item?.score === 'number' && !Number.isNaN(item.score);
  const scorePct = hasNumericScore ? Math.round(item.score * 100) : null;

  const firstMedia = Array.isArray(item.media) && item.media.length > 0 ? item.media[0] : null;
  const imageSrc = firstMedia ? `${API_BASE}/api/files/${firstMedia.filename}` : null;

  return (
    <div className="item-card">
      {/* Kebab menu (optional) */}
      {menuOptions.length > 0 && (
        <div className="options-menu-container" ref={menuRef}>
          <button
            className="options-btn"
            onClick={() => setIsMenuOpen((s) => !s)}
            aria-label={t('common.moreOptions', 'More options')}
            type="button"
          >
            ⋮
          </button>
          {isMenuOpen && (
            <ul className="options-menu" role="menu">
              {menuOptions.map((option, idx) => (
                <li
                  key={idx}
                  className={option.className || ''}
                  role="menuitem"
                  onClick={() => {
                    option.onClick?.();
                    setIsMenuOpen(false);
                  }}
                >
                  {option.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Media */}
      <div className="item-image-placeholder">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.itemName ? `${item.itemName} photo` : t('common.itemImage', 'Item image')}
            className="item-image"
            loading="lazy"
          />
        ) : (
          <span>{t('common.noImage', 'No Image')}</span>
        )}
      </div>

      {/* Content */}
      <div className="item-card-content">
        <h3 className="title">{item.itemName}</h3>

        <p className="item-location">
          <strong>{t('items.location', 'Location')}:</strong> {item.location}
        </p>

        <p className="item-description">{item.description}</p>

        {/* Match meta row: Similarity pill + action button */}
        {actionButton && (
          <div className="match-meta">
            {isMatch && (
              // Choose one of the two behaviors:
              // A) Show Unknown if no score:
              <span
                className="similarity-badge"
                title={t('matchesPage.similarity', 'Similarity')}
              >
                {t('matchesPage.similarity', 'Similarity')}:{' '}
                {hasNumericScore && scorePct >= 1
                  ? `${scorePct}%`
                  : t('matchesPage.unknown', 'Unknown')}
              </span>

              // B) Or hide entirely if score missing / <1%:
              // (Uncomment the block below and remove the one above)
              // <>
              //   {hasNumericScore && scorePct >= 1 && (
              //     <span className="similarity-badge">
              //       {t('matchesPage.similarity', 'Similarity')}: {scorePct}%
              //     </span>
              //   )}
              //   {!hasNumericScore || scorePct < 1 ? <span /> : null}
              // </>
            )}

            <div className="match-action">
              <button
                className={`btn-submit ${actionButton.className || ''}`}
                onClick={actionButton.onClick}
                type="button"
              >
                {actionButton.text ??
                  t('matchesPage.claimButton', 'Request Claim')}
              </button>
            </div>
          </div>
        )}

        {/* Footer (tags/date) */}
        <div className="item-card-footer">
          <span className="item-category">{item.subCategory}</span>
          <span className="item-date">
            {item.status === 'Found'
              ? t('items.foundOn', 'Found on:')
              : t('items.lostOn', 'Lost on:')}{' '}
            {formatDate(item.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
