import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState({ privateChats: [], groupChats: [] });
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const newSocket = io('http://localhost:5000');

        newSocket.on('connect', () => {
            console.log('מחובר לשרת WebSocket');
            setConnected(true);
            setSocket(newSocket);
        });

        newSocket.on('login_success', (userData) => {
            console.log('כניסה הצליחה:', userData);
            setUser(userData);

            newSocket.emit('get_chats');

            newSocket.emit('get_users');
        });

        newSocket.on('chats_list', (chatsData) => {
            console.log('קיבלנו רשימת צ\'אטים:', chatsData);
            setChats(chatsData);
        });

        newSocket.on('users_list', (usersData) => {
            console.log('קיבלנו רשימת משתמשים:', usersData);
            setUsers(usersData);
        });

        newSocket.on('chat_history', (data) => {
            console.log('קיבלנו היסטוריית צ\'אט:', data);
            setMessages(data.messages || []);
            setCurrentChat(data);
        });

        newSocket.on('new_message', (data) => {
            console.log('הודעה חדשה:', data);
            setMessages((prevMessages) => [...prevMessages, data.message]);
        });

        newSocket.on('typing_status', (data) => {
            console.log('סטטוס הקלדה:', data);
            setTypingUsers(data.typingUsers || []);
        });

        newSocket.on('user_status_change', (userData) => {
            console.log('שינוי סטטוס משתמש:', userData);

            setUsers((prevUsers) =>
                prevUsers.map(user =>
                    user.userId === userData.userId
                        ? { ...user, isOnline: userData.isOnline }
                        : user
                )
            );

            newSocket.emit('get_chats');
        });

        newSocket.on('disconnect', () => {
            console.log('התנתקנו מהשרת WebSocket');
            setConnected(false);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const login = (username) => {
        if (socket && username.trim()) {
            socket.emit('login', { username });
        }
    };

    const sendMessage = (content) => {
        if (socket && currentChat && content.trim()) {
            socket.emit('send_message', { chatId: currentChat.chatId, content });
        }
    };

    const updateTyping = (isTyping) => {
        if (socket && currentChat) {
            socket.emit('typing', { chatId: currentChat.chatId, isTyping });
        }
    };

    const openChat = (chatId) => {
        if (socket && chatId) {
            socket.emit('join_chat', { chatId });
        }
    };

    const createPrivateChat = (targetUserId) => {
        if (socket && targetUserId) {
            socket.emit('create_private_chat', { targetUserId });
        }
    };

    const createGroupChat = (name, participants) => {
        if (socket && name.trim() && participants.length > 0) {
            socket.emit('create_group_chat', { name, participants });
        }
    };

    const value = {
        socket,
        connected,
        user,
        chats,
        currentChat,
        messages,
        typingUsers,
        users,
        login,
        sendMessage,
        updateTyping,
        openChat,
        createPrivateChat,
        createGroupChat
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};