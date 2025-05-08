import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const { login } = useSocket();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            login(username);
        }
    };

    return (
        <>
            <div className="login-container">
                <div className="login-box">
                    <h1>ברוכים הבאים לצ'אט</h1>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="הכנס את שמך"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <button type="submit">כניסה לצ'אט</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;