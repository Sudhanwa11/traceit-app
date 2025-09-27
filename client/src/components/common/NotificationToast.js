// client/src/components/common/NotificationToast.js
import React from 'react';
import './NotificationToast.css';

const NotificationToast = ({ message, onClose }) => {
    return (
        <div className="notification-toast show">
            <p>{message}</p>
            <button onClick={onClose}>×</button>
        </div>
    );
};

export default NotificationToast;