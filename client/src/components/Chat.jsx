import React from 'react';
import ChatList from './ChatList';
import Conversation from './Conversation';
import Login from './Login';
import { useSocket } from '../context/SocketContext';

const Chat = () => {
    const { connected, user } = useSocket();

    if (!connected) {
        return (
            <div className="loading-container">
                <div className="loading-message">
                    מתחבר לשרת...
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return (
        <>
            <div className="chat-container">
                <div className="sidebar">
                    <div className="user-info">
                        <span className="username">{user.username}</span>
                        <span className="online-badge"> מחובר </span>
                    </div>
                    <ChatList />
                </div>
                <div className="chat-main">
                    <Conversation />
                </div>
            </div>
        </>
    );
};

export default Chat;