import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import UserStatus from './UserStatus';

const ChatList = () => {
    const { chats, currentChat, openChat, users, createPrivateChat, createGroupChat } = useSocket();
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [chatType, setChatType] = useState('private');
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    const handleChatClick = (chatId) => {
        openChat(chatId);
    };

    const openNewChatModal = () => {
        setShowNewChatModal(true);
        setChatType('private');
        setGroupName('');
        setSelectedUsers([]);
    };

    const closeNewChatModal = () => {
        setShowNewChatModal(false);
    };

    const toggleUserSelection = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleCreateChat = () => {
        if (chatType === 'private' && selectedUsers.length === 1) {
            createPrivateChat(selectedUsers[0]);
        } else if (chatType === 'group' && groupName.trim() && selectedUsers.length > 0) {
            createGroupChat(groupName, selectedUsers);
        }
        closeNewChatModal();
    };

    const formatLastMessageTime = (timestamp) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <div className="chat-list" style={{ height: '100vh', width: '500vw', overflowY: 'auto' }}>
                <div className="chat-list-header">
                    <h2>שיחות</h2>
                    <button className="new-chat-button" onClick={openNewChatModal}>
                        צ'אט חדש
                    </button>
                </div>

                {chats.privateChats.length > 0 && (
                    <>
                        <div className="chat-category">צ'אטים פרטיים</div>
                        {chats.privateChats.map(chat => (
                            <div
                                key={chat.id}
                                className={`chat-item ${currentChat?.chatId === chat.id ? 'active' : ''}`}
                                onClick={() => handleChatClick(chat.id)}
                            >
                                <div className="chat-item-header">
                                    <div className="chat-item-name">
                                        <UserStatus isOnline={chat.isOnline} />
                                        {chat.name}
                                    </div>
                                    {chat.lastMessage && (
                                        <div className="chat-item-time">
                                            {formatLastMessageTime(chat.lastMessage.timestamp)}
                                        </div>
                                    )}
                                </div>
                                {chat.lastMessage && (
                                    <div className="chat-item-last-message">
                                        {chat.lastMessage.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {chats.groupChats.length > 0 && (
                    <>
                        <div className="chat-category">צ'אטים קבוצתיים</div>
                        {chats.groupChats.map(chat => (
                            <div
                                key={chat.id}
                                className={`chat-item ${currentChat?.chatId === chat.id ? 'active' : ''}`}
                                onClick={() => handleChatClick(chat.id)}
                            >
                                <div className="chat-item-header">
                                    <div className="chat-item-name">
                                        {chat.name} ({chat.participants})
                                    </div>
                                    {chat.lastMessage && (
                                        <div className="chat-item-time">
                                            {formatLastMessageTime(chat.lastMessage.timestamp)}
                                        </div>
                                    )}
                                </div>
                                {chat.lastMessage && (
                                    <div className="chat-item-last-message">
                                        {chat.lastMessage.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {showNewChatModal && (
                    <div className="new-chat-modal">
                        <div className="new-chat-modal-content">
                            <h2>יצירת צ'אט חדש</h2>

                            <select
                                value={chatType}
                                onChange={(e) => setChatType(e.target.value)}
                            >
                                <option value="private">צ'אט פרטי</option>
                                <option value="group">צ'אט קבוצתי</option>
                            </select>

                            {chatType === 'group' && (
                                <input
                                    type="text"
                                    placeholder="שם הקבוצה"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                />
                            )}

                            <div className="users-list">
                                <h3>בחר משתמשים:</h3>
                                {users.map(user => (
                                    <div key={user.userId} className="user-checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.userId)}
                                                onChange={() => toggleUserSelection(user.userId)}
                                            />
                                            <UserStatus isOnline={user.isOnline} />
                                            {user.username}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-buttons">
                                <button className="cancel" onClick={closeNewChatModal}>ביטול</button>
                                <button
                                    className="create"
                                    onClick={handleCreateChat}
                                    disabled={
                                        (chatType === 'private' && selectedUsers.length !== 1) ||
                                        (chatType === 'group' && (groupName.trim() === '' || selectedUsers.length === 0))
                                    }
                                >
                                    יצירה
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ChatList;