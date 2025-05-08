const {
    users,
    privateChatsExists,
    createPrivateChat,
    createGroupChat,
    addUserToGroupChat,
    addMessage,
    getUserChats,
    getChatMessages,
    typing
} = require('./data');

const registerSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log(`משתמש חדש התחבר: ${socket.id}`);

        socket.on('login', ({ username }) => {
            const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            users.set(userId, {
                username,
                isOnline: true,
                socketId: socket.id
            });

            socket.userId = userId;

            socket.emit('login_success', { userId, username });

            io.emit('user_status_change', { userId, username, isOnline: true });
        });

        socket.on('get_chats', () => {
            if (!socket.userId) return;

            const userChats = getUserChats(socket.userId);
            socket.emit('chats_list', userChats);
        });

        socket.on('get_users', () => {
            if (!socket.userId) return;

            const usersList = [];
            for (const [userId, userData] of users.entries()) {
                if (userId !== socket.userId) {
                    usersList.push({
                        userId,
                        username: userData.username,
                        isOnline: userData.isOnline
                    });
                }
            }

            socket.emit('users_list', usersList);
        });

        socket.on('create_private_chat', ({ targetUserId }) => {
            if (!socket.userId || !users.has(targetUserId)) return;

            if (!privateChatsExists(socket.userId, targetUserId)) {
                const chatId = createPrivateChat(socket.userId, targetUserId);

                const userChats = getUserChats(socket.userId);
                socket.emit('chats_list', userChats);

                const targetSocketId = users.get(targetUserId)?.socketId;
                if (targetSocketId) {
                    const targetUserChats = getUserChats(targetUserId);
                    io.to(targetSocketId).emit('chats_list', targetUserChats);
                }
            }
        });

        socket.on('create_group_chat', ({ name, participants }) => {
            if (!socket.userId) return;

            const chatId = createGroupChat(name, socket.userId);

            if (Array.isArray(participants)) {
                participants.forEach(userId => {
                    if (users.has(userId)) {
                        addUserToGroupChat(chatId, userId);
                    }
                });
            }

            const updatedParticipants = [socket.userId, ...participants].filter(userId => users.has(userId));

            updatedParticipants.forEach(userId => {
                const userChats = getUserChats(userId);
                const userSocketId = users.get(userId)?.socketId;

                if (userSocketId) {
                    io.to(userSocketId).emit('chats_list', userChats);
                }
            });
        });

        socket.on('join_chat', ({ chatId }) => {
            if (!socket.userId) return;

            Object.keys(socket.rooms).forEach(room => {
                if (room !== socket.id) {
                    socket.leave(room);
                }
            });

            socket.join(chatId);

            const chatData = getChatMessages(chatId);
            if (chatData) {
                const messagesWithUsernames = chatData.messages.map(msg => ({
                    ...msg,
                    username: users.get(msg.senderId)?.username || 'משתמש לא ידוע'
                }));

                const participantsData = chatData.participants.map(userId => ({
                    userId,
                    username: users.get(userId)?.username || 'משתמש לא ידוע',
                    isOnline: users.get(userId)?.isOnline || false
                }));

                socket.emit('chat_history', {
                    chatId,
                    messages: messagesWithUsernames,
                    type: chatData.type,
                    name: chatData.name,
                    participants: participantsData
                });
            }
        });

        socket.on('send_message', ({ chatId, content }) => {
            if (!socket.userId || !content.trim()) return;

            const result = addMessage(chatId, socket.userId, content);

            if (result) {
                const { message, chat } = result;
                const username = users.get(socket.userId)?.username || 'משתמש לא ידוע';

                io.to(chatId).emit('new_message', {
                    chatId,
                    message: {
                        ...message,
                        username
                    }
                });

                chat.participants.forEach(userId => {
                    const userChats = getUserChats(userId);
                    const userSocketId = users.get(userId)?.socketId;

                    if (userSocketId) {
                        io.to(userSocketId).emit('chats_list', userChats);
                    }
                });
            }
        });

        socket.on('typing', ({ chatId, isTyping }) => {
            if (!socket.userId) return;

            if (!typing.has(chatId)) {
                typing.set(chatId, new Set());
            }

            const chatTyping = typing.get(chatId);

            if (isTyping) {
                chatTyping.add(socket.userId);
            } else {
                chatTyping.delete(socket.userId);
            }

            const typingUsers = Array.from(chatTyping).map(userId => ({
                userId,
                username: users.get(userId)?.username || 'משתמש לא ידוע'
            }));

            socket.to(chatId).emit('typing_status', { chatId, typingUsers });
        });

        socket.on('disconnect', () => {
            console.log(`משתמש התנתק: ${socket.id}`);

            if (socket.userId && users.has(socket.userId)) {
                const userData = users.get(socket.userId);
                userData.isOnline = false;

                io.emit('user_status_change', {
                    userId: socket.userId,
                    username: userData.username,
                    isOnline: false
                });

                for (const [chatId, typingSet] of typing.entries()) {
                    if (typingSet.has(socket.userId)) {
                        typingSet.delete(socket.userId);

                        const typingUsers = Array.from(typingSet).map(userId => ({
                            userId,
                            username: users.get(userId)?.username || 'משתמש לא ידוע'
                        }));

                        io.to(chatId).emit('typing_status', { chatId, typingUsers });
                    }
                }
            }
        });
    });
};

module.exports = { registerSocketHandlers };