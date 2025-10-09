// client/src/pages/ChatPage.js
import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import chatService from '../services/chatService';
import io from 'socket.io-client';
import './ChatPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ChatPage = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // NEW: files + previews
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const seenIdsRef = useRef(new Set()); // dedupe guard

  // Prefer server-provided header (self/other/item). Fallback to participants if header missing.
  const selfFromHeader = conversation?.header?.self;
  const otherFromHeader = conversation?.header?.other;

  const otherUser = useMemo(() => {
    if (otherFromHeader) return otherFromHeader;
    if (!conversation || !user) return null;
    const p = conversation.participants?.find(p => String(p._id) !== String(user._id));
    return p ? { _id: p._id, name: p.name, department: p.department, role: 'Participant' } : null;
  }, [conversation, user, otherFromHeader]);

  const selfUser = useMemo(() => {
    if (selfFromHeader) return selfFromHeader;
    return user ? { _id: user._id, name: user.name, department: user.department, role: 'You' } : null;
  }, [selfFromHeader, user]);

  // ------- bootstrap: fetch + sockets -------
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (authLoading) return;

    let isMounted = true;

    const bootstrap = async () => {
      try {
        const data = await chatService.getConversationByClaim(claimId);
        if (!isMounted) return;

        setConversation(data.conversation);

        const initial = Array.isArray(data.messages) ? data.messages : [];
        initial.forEach((m) => seenIdsRef.current.add(String(m._id)));
        setMessages(initial);
      } catch (err) {
        console.error('Failed to fetch conversation', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    bootstrap();

    socketRef.current = io(API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: false,
    });

    if (user?._id) {
      socketRef.current.emit('addUser', user._id);
    }

    socketRef.current.on('receiveMessage', (message) => {
      const id = String(message?._id || '');
      if (!id || seenIdsRef.current.has(id)) return;
      seenIdsRef.current.add(id);
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      isMounted = false;
      try { socketRef.current?.disconnect(); } catch {}
    };
  }, [claimId, isAuthenticated, authLoading, navigate, user]);

  // auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ------- file picking + preview -------
  const onPickFiles = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setFiles(list);
    const urls = list.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
  };

  const clearFiles = () => {
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls([]);
    setFiles([]);
  };

  // helper to render attachment src
  const fileSrc = (att) => {
    if (att.__previewUrl) return att.__previewUrl; // optimistic
    // server serves by filename; adjust if using id-based route
    return `${API_URL}/api/files/${att.filename}`;
  };

  // ------- send message (text and/or files) -------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text && files.length === 0) return;
    if (!conversation?._id) return;

    const tempId = `temp-${Date.now()}`;

    const optimistic = {
      _id: tempId,
      conversationId: conversation._id,
      text,
      sender: { _id: user._id, name: user.name },
      createdAt: new Date().toISOString(),
      pending: true,
      attachments: files.map((f, i) => ({
        fileId: `local-${i}`,
        filename: f.name,
        contentType: f.type,
        __previewUrl: previewUrls[i],
      })),
    };

    setMessages((prev) => [...prev, optimistic]);
    setNewMessage('');

    try {
      let saved;
      if (files.length && chatService.postMessageWithFiles) {
        saved = await chatService.postMessageWithFiles({
          conversationId: conversation._id,
          text,
          files,
        });
      } else {
        saved = await chatService.postMessage({
          conversationId: conversation._id,
          text,
        });
      }

      setMessages((prev) => {
        const realId = String(saved?._id || '');
        if (realId && !seenIdsRef.current.has(realId)) {
          seenIdsRef.current.add(realId);
        }
        const idx = prev.findIndex((m) => m._id === tempId);
        if (idx >= 0) {
          const copy = prev.slice();
          copy[idx] = saved;
          return copy;
        }
        if (realId && prev.some((m) => String(m._id) === realId)) return prev;
        return [...prev, saved];
      });
    } catch (err) {
      console.error('Failed to send message', err);
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, failed: true, pending: false } : m))
      );
    } finally {
      clearFiles();
    }
  };

  if (loading || authLoading) {
    return <div className="loader">Loading Chat...</div>;
  }

  const otherRoleLabel = otherUser?.role || 'Participant';

  return (
    <div className="chat-page-container">
      {/* Header */}
      <div className="chat-header">
        <div className="party you">
          <div className="avatar">{(selfUser?.name || 'Y').slice(0, 1).toUpperCase()}</div>
          <div className="party-info">
            <div className="party-name">{selfUser?.name || 'You'}</div>
            {selfUser?.department && <div className="party-sub">{selfUser.department}</div>}
            <div className="party-role">You</div>
          </div>
        </div>

        <div className="divider">↔</div>

        <div className="party other">
          <div className="avatar alt">{(otherUser?.name || '?').slice(0, 1).toUpperCase()}</div>
          <div className="party-info">
            <div className="party-name">{otherUser?.name || 'Unknown user'}</div>
            {otherUser?.department && <div className="party-sub">{otherUser.department}</div>}
            <div className="party-role">{otherRoleLabel}</div>
          </div>
        </div>
      </div>

      {/* Item context (optional) */}
      {conversation?.header?.item && (
        <div className="chat-context">
          <div className="ctx-title">{conversation.header.item.name}</div>
          <div className="ctx-sub">Status: {conversation.header.item.status}</div>
        </div>
      )}

      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((msg) => {
            const mine = String(msg.sender?._id) === String(user?._id);
            return (
              <div key={msg._id} className={`message ${mine ? 'sent' : 'received'}`}>
                <div className="message-meta">
                  <span className="sender-name">{msg.sender?.name || 'User'}</span>
                  <span className="time">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* text bubble if any */}
                {msg.text && (
                  <div
                    className={`message-bubble ${msg.pending ? 'pending' : ''} ${
                      msg.failed ? 'failed' : ''
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {/* image attachments */}
                {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                  <div className="attachments">
                    {msg.attachments.map((att, i) => (
                      <a
                        key={`${msg._id}-${i}`}
                        href={fileSrc(att)}
                        target="_blank"
                        rel="noreferrer"
                        className="attachment-thumb"
                        title={att.filename}
                      >
                        <img src={fileSrc(att)} alt={att.filename} />
                      </a>
                    ))}
                  </div>
                )}

                {msg.failed && <div className="message-status error">Failed to send</div>}
                {msg.pending && !msg.failed && <div className="message-status">Sending…</div>}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected previews before sending */}
        {previewUrls.length > 0 && (
          <div className="preview-strip">
            {previewUrls.map((u, i) => (
              <div key={i} className="preview">
                <img src={u} alt={`preview-${i}`} />
              </div>
            ))}
            <button className="clear-previews" onClick={clearFiles}>Clear</button>
          </div>
        )}

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <label className="pick-file" title="Attach images">
            <input type="file" accept="image/*" multiple onChange={onPickFiles} />
            📎
          </label>
          <input
            type="text"
            placeholder="Type a message…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" disabled={!newMessage.trim() && files.length === 0}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
