// client/src/components/rewards/ProgressBar.js
import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;

    return (
        <div className="progress-bar-container">
            <div 
                className="progress-bar-filler" 
                style={{ width: `${percentage}%` }}
            >
                <span className="progress-bar-label">{`${value} / ${max} pts`}</span>
            </div>
        </div>
    );
};

export default ProgressBar;