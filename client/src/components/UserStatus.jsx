import React from 'react';

const UserStatus = ({ isOnline }) => {
    return (
        <span
            className={`online-status ${isOnline ? 'online' : 'offline'}`}
            title={isOnline ? 'מחובר' : 'לא מחובר'}
        />
    );
};

export default UserStatus;