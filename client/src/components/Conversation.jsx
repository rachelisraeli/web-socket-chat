import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import { useSocket } from '../context/SocketContext';

const Conversation = () => {
    const { currentChat, messages, typingUsers, sendMessage, updateTyping, user } = useSocket();
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInputChange = (e) => {
        setInputMessage(e.target.value);

        if (!isTyping && e.target.value.trim()) {
            setIsTyping(true);
            updateTyping(true);
        } else if (isTyping && !e.target.value.trim()) {
            setIsTyping(false);
            updateTyping(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (inputMessage.trim()) {
            sendMessage(inputMessage);
            setInputMessage('');
            setIsTyping(false);
            updateTyping(false);
        }
    };

    if (!currentChat) {
        return (
            <>
                <div className="no-conversation" style={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="no-conversation-content">
                        <h3>אין שיחה פעילה</h3>
                        <p>בחר שיחה מהרשימה או צור שיחה חדשה כדי להתחיל</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="conversation-container" style={{ height: '100vh', width: '80vw', display: 'flex', flexDirection: 'column', padding: '20px' }}>
                <div className="conversation-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2>
                        {currentChat.isGroup ?
                            currentChat.name :
                            currentChat.participants.find(p => p.userId !== user?.userId)?.username}
                    </h2>
                    {typingUsers.length > 0 && (
                        <div className="typing-status">
                            {typingUsers.join(', ')} מקליד/ה...
                        </div>
                    )}
                </div>

                <div className="messages-container" style={{ flex: 1, overflowY: 'auto', padding: '10px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                    {messages.length === 0 ? (
                        <div className="no-messages">
                            אין הודעות עדיין. שלח הודעה כדי להתחיל שיחה.
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <Message
                                key={msg._id || index}
                                message={msg}
                            />
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="message-input-form">
                    <div className="message-input-container">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={handleInputChange}
                            placeholder="הקלד הודעה..."
                            className="message-input"
                            style={{ width: '70%', height: '100%', padding: '10px', borderRadius: '5px', margin: '10px', border: '1px solid #ccc' }}
                        />
                        <button
                            type="submit"
                            className="send-button"
                            disabled={!inputMessage.trim()}
                            style={{
                                backgroundColor: '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '10px 20px',
                                cursor: 'pointer',
                                marginLeft: '10px'
                            }}
                        >
                            שלח
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Conversation;