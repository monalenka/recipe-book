import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'error', duration = 3000) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
                {notifications.map(notif => (
                    <div
                        key={notif.id}
                        style={{
                            backgroundColor: notif.type === 'error' ? '#e74c3c' : '#2ecc71',
                            color: 'white',
                            padding: '10px 20px',
                            marginBottom: '10px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            animation: 'fadeIn 0.3s',
                        }}
                    >
                        {notif.message}
                    </div>
                ))}
            </div>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);