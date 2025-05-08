class SocketManager {
    constructor(socket) {
        this.socket = socket;
        this.listeners = new Map();
    }

    addListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        const listener = callback;
        this.listeners.get(event).push(listener);
        this.socket.on(event, listener);

        return () => this.removeListener(event, listener);
    }

    removeListener(event, callback) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            const index = eventListeners.indexOf(callback);
            if (index !== -1) {
                eventListeners.splice(index, 1);
                this.socket.off(event, callback);
            }
        }
    }

    removeAllListeners(event) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(listener => {
                this.socket.off(event, listener);
            });
            this.listeners.delete(event);
        }
    }

    emit(event, data) {
        return new Promise((resolve, reject) => {
            this.socket.emit(event, data, (response) => {
                if (response && response.error) {
                    reject(response.error);
                } else {
                    resolve(response);
                }
            });
        });
    }

    reconnect(options = {}) {
        const { retries = 5, interval = 2000 } = options;
        let attempts = 0;

        const attemptReconnect = () => {
            if (attempts >= retries) {
                console.error('נכשל בניסיון חיבור מחדש לאחר', retries, 'ניסיונות');
                return;
            }

            attempts++;
            console.log(`ניסיון חיבור מחדש ${attempts}/${retries}...`);

            this.socket.connect();
        };

        this.socket.on('disconnect', () => {
            console.log('מנותק מהשרת, מנסה להתחבר מחדש...');
            setTimeout(attemptReconnect, interval);
        });
    }
}

export const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }) +
            ' ' + date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    }
};

export class MessageCache {
    constructor(capacity = 100) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    addMessages(chatId, messages) {
        if (!this.cache.has(chatId)) {
            this.cache.set(chatId, []);
        }

        const chatMessages = this.cache.get(chatId);
        const newMessages = messages.filter(
            newMsg => !chatMessages.some(msg => msg._id === newMsg._id)
        );

        chatMessages.push(...newMessages);

        if (chatMessages.length > this.capacity) {
            const excess = chatMessages.length - this.capacity;
            chatMessages.splice(0, excess);
        }

        return chatMessages;
    }

    getMessages(chatId) {
        return this.cache.get(chatId) || [];
    }

    clear() {
        this.cache.clear();
    }
}

export { SocketManager };
export default SocketManager;