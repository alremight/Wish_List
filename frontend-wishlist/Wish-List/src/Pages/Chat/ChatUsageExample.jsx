import { useEffect, useState } from 'react';
import ChatComponent from './ChatComponent';

const ChatUsageExample = () => {
    const [username, setUsername] = useState("");

    useEffect(() => {
        const storedUsername = sessionStorage.getItem('Username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    return (
        <div className="container">
            <h1>Чат</h1>
            {username ? (
                <ChatComponent userName={username} />
            ) : (
                <p>Загрузка...</p>
            )}
        </div>
    );
};

export default ChatUsageExample;
