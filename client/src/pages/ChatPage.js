// client/src/pages/ChatPage.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import chatService from '../services/chatService';
import io from 'socket.io-client';
import './ChatPage.css';

const ChatPage = () => {
    const { claimId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);

    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        } else if (isAuthenticated) {
            // Fetch initial conversation data
            const fetchConversation = async () => {
                try {
                    const data = await chatService.getConversationByClaim(claimId);
                    setConversation(data.conversation);
                    setMessages(data.messages);
                } catch (error) {
                    console.error("Failed to fetch conversation", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchConversation();

            // Setup Socket.IO connection
            socketRef.current = io("http://localhost:5000");
            socketRef.current.emit("addUser", user._id);

            socketRef.current.on("receiveMessage", (message) => {
                setMessages(prevMessages => [...prevMessages, message]);
            });

            // Disconnect on cleanup
            return () => socketRef.current.disconnect();
        }
    }, [claimId, isAuthenticated, authLoading, navigate, user]);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const messageData = {
                conversationId: conversation._id,
                text: newMessage,
            };
            // We post the message, and the backend emits it back to us and the recipient
            await chatService.postMessage(messageData);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    if (loading || authLoading) {
        return <div className="loader">Loading Chat...</div>;
    }

    return (
        <div className="chat-page-container">
            <div className="chat-box">
                <div className="chat-messages">
                    {messages.map((msg) => (
                        <div key={msg._id} className={`message ${msg.sender._id === user._id ? 'sent' : 'received'}`}>
                            <div className="message-content">
                                <span className="sender-name">{msg.sender.name}</span>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;