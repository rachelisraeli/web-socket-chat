const users = new Map(); // {userId: {username, isOnline, socketId}}

const groupChats = new Map(); // {chatId: {name, participants: [userId], messages: [{senderId, content, timestamp}]}}

const privateChats = new Map(); // {chatId: {participants: [userId1, userId2], messages: [{senderId, content, timestamp}]}}

const getPrivateChatId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    return `private_${sortedIds[0]}_${sortedIds[1]}`;
};

const privateChatsExists = (userId1, userId2) => {
    const chatId = getPrivateChatId(userId1, userId2);
    return privateChats.has(chatId);
};

const createPrivateChat = (userId1, userId2) => {
    const chatId = getPrivateChatId(userId1, userId2);

    if (!privateChats.has(chatId)) {
        privateChats.set(chatId, {
            participants: [userId1, userId2],
            messages: []
        });
    }

    return chatId;
};

const createGroupChat = (name, creatorId) => {
    const chatId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    groupChats.set(chatId, {
        name,
        participants: [creatorId],
        messages: []
    });

    return chatId;
};

const addUserToGroupChat = (chatId, userId) => {
    const chat = groupChats.get(chatId);

    if (chat && !chat.participants.includes(userId)) {
        chat.participants.push(userId);
        return true;
    }

    return false;
};

const addMessage = (chatId, senderId, content) => {
    const message = {
        senderId,
        content,
        timestamp: Date.now()
    };

    if (chatId.startsWith('private_')) {
        const chat = privateChats.get(chatId);
        if (chat) {
            chat.messages.push(message);
            return { message, chat };
        }
    } else if (chatId.startsWith('group_')) {
        const chat = groupChats.get(chatId);
        if (chat) {
            chat.messages.push(message);
            return { message, chat };
        }
    }

    return null;
};

const getUserChats = (userId) => {
    const userChats = {
        privateChats: [],
        groupChats: []
    };

    for (const [chatId, chat] of privateChats.entries()) {
        if (chat.participants.includes(userId)) {
            const otherUserId = chat.participants.find(id => id !== userId);
            const otherUser = users.get(otherUserId) || { username: 'משתמש לא ידוע' };

            userChats.privateChats.push({
                id: chatId,
                name: otherUser.username,
                lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null,
                isOnline: otherUser.isOnline || false
            });
        }
    }

    for (const [chatId, chat] of groupChats.entries()) {
        if (chat.participants.includes(userId)) {
            userChats.groupChats.push({
                id: chatId,
                name: chat.name,
                lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null,
                participants: chat.participants.length
            });
        }
    }

    return userChats;
};

const getChatMessages = (chatId) => {
    if (chatId.startsWith('private_')) {
        const chat = privateChats.get(chatId);
        return chat ? { messages: chat.messages, type: 'private', participants: chat.participants } : null;
    } else if (chatId.startsWith('group_')) {
        const chat = groupChats.get(chatId);
        return chat ? { messages: chat.messages, type: 'group', name: chat.name, participants: chat.participants } : null;
    }

    return null;
};

const typing = new Map(); // {chatId: Set(userIds)}

module.exports = {
    users,
    groupChats,
    privateChats,
    typing,
    getPrivateChatId,
    privateChatsExists,
    createPrivateChat,
    createGroupChat,
    addUserToGroupChat,
    addMessage,
    getUserChats,
    getChatMessages
};