import React from 'react';
import { useSocket } from '../context/SocketContext';

const Message = ({ message }) => {
    const { user } = useSocket();

    const isSentByMe = user && message.senderId === user.userId;

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <div className={`message ${isSentByMe ? 'received' : 'sent'}`}>
                <div className="message-header">
                    <span className="message-user">{isSentByMe ? 'אני' : message.username}</span>
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
                <div className="message-content">{message.content}</div>
            </div>
        </>
    );
};

export default Message;