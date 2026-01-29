import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { VISUAL_DEFAULTS, WINDOW_DEFAULTS } from '../config/appDefaults';
import useFloatingWindow from '../hooks/useFloatingWindow';
import WindowFrame from './WindowFrame';

/**
 * ChatPanel - Glassy Hyprland-style draggable chat window
 * Matches TerminalWindow and ActivityLog styling
 */
export default function ChatPanel({ onSend, onClose, messages, themeColor = VISUAL_DEFAULTS.theme.hex }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { position, size, isDragging, handleMouseDown, handleResizeMouseDown } = useFloatingWindow({
    initialPosition: WINDOW_DEFAULTS.layout.chat.position,
    initialSize: WINDOW_DEFAULTS.layout.chat.size,
    minSize: WINDOW_DEFAULTS.layout.chat.minSize
  });

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <WindowFrame
      isOpen
      position={position}
      size={size}
      isDragging={isDragging}
      onMouseDown={handleMouseDown}
      onResizeMouseDown={handleResizeMouseDown}
      onClose={onClose}
      title="Communicate with DNA"
      badge={messages.length}
      themeColor={themeColor}
      contentStyle={{ display: 'flex', flexDirection: 'column' }}
    >
      <div
        className="chat-content"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.08) transparent'
        }}
      >
        {messages.map((msg, i) => (
          <Message key={i} message={msg} themeColor={themeColor} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="chat-input"
        style={{
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '13px',
              fontFamily: '"Inter", sans-serif',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = `${themeColor}60`;
              e.target.style.background = 'rgba(255,255,255,0.06)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.08)';
              e.target.style.background = 'rgba(255,255,255,0.04)';
            }}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              border: 'none',
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)`,
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 20px ${themeColor}30`
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </motion.button>
        </div>
      </form>
    </WindowFrame>
  );
}

function Message({ message, themeColor }) {
  const isUser = message.type === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%'
      }}
    >
      <div style={{
        padding: '10px 14px',
        borderRadius: '12px',
        borderBottomRightRadius: isUser ? 4 : 12,
        borderBottomLeftRadius: isUser ? 12 : 4,
        background: isUser
          ? `linear-gradient(135deg, ${themeColor}35, ${themeColor}20)`
          : 'rgba(255,255,255,0.04)',
        color: isUser ? 'rgba(255,255,255,0.9)' : themeColor,
        fontSize: '13px',
        lineHeight: 1.5,
        wordBreak: 'break-word',
        fontFamily: '"Inter", sans-serif',
        border: isUser
          ? `1px solid ${themeColor}40`
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isUser 
          ? `0 2px 12px ${themeColor}15`
          : 'none'
      }}>
        {message.content || '...'}
      </div>
    </motion.div>
  );
}