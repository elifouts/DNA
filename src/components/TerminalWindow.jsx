import { useState, useEffect, useRef } from 'react';
import { BACKEND, STATS_DEFAULTS, VISUAL_DEFAULTS, WINDOW_DEFAULTS } from '../config/appDefaults';
import useFloatingWindow from '../hooks/useFloatingWindow';
import WindowFrame from './WindowFrame';

/**
 * TerminalWindow - Interactive DNA terminal with command support
 * Type commands to interact with DNA directly
 */
export default function TerminalWindow({ isOpen, onClose, themeColor = VISUAL_DEFAULTS.theme.hex, mockMode = false }) {
  const [history, setHistory] = useState([
    { type: 'system', content: 'DNA Terminal v1.0 - Type "help" for commands' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const lastLogCountRef = useRef(0);
  const { position, size, isDragging, handleMouseDown, handleResizeMouseDown } = useFloatingWindow({
    initialPosition: WINDOW_DEFAULTS.layout.terminal.position,
    initialSize: WINDOW_DEFAULTS.layout.terminal.size,
    minSize: WINDOW_DEFAULTS.layout.terminal.minSize
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Stream terminal logs from backend (disabled in mock mode)
  useEffect(() => {
    if (!isOpen || mockMode || !BACKEND.enabled) return;

    let isActive = true;
    const fetchLogs = async () => {
      try {
        const since = lastLogCountRef.current || 0;
        const res = await fetch(`${BACKEND.baseUrl}${BACKEND.endpoints.terminalLogs}?limit=200&since=${since}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!isActive || !Array.isArray(data.logs)) return;

        if (typeof data.total === 'number') {
          lastLogCountRef.current = data.total;
        } else {
          lastLogCountRef.current = since + data.logs.length;
        }

        if (data.logs.length > 0) {
          setHistory(prev => {
            const appended = [...prev, ...data.logs.map(line => ({ type: 'output', content: line }))];
            return appended.slice(-400);
          });
        }
      } catch (e) {
        // ignore
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 300);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [isOpen, mockMode]);

  const executeCommand = async (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Add command to history
    setHistory(prev => [...prev, { type: 'input', content: `> ${trimmed}` }]);
    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInputValue('');

    // Parse command
    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Handle local commands
    if (command === 'clear') {
      setHistory([{ type: 'system', content: 'Terminal cleared.' }]);
      return;
    }

    if (mockMode || !BACKEND.enabled) {
      const responses = {
        help: 'Available commands: help, status, stats, ping, clear',
        status: 'DNA Status: live (mock)',
        stats: `Nodes: ${STATS_DEFAULTS.nodeCount} | Links: ${STATS_DEFAULTS.connectionCount} | IQ: ${Math.round(STATS_DEFAULTS.intelligence * 100)}`,
        ping: 'pong'
      };
      const output = responses[command] || `Unknown command: ${command}`;
      setHistory(prev => [...prev, {
        type: responses[command] ? 'output' : 'error',
        content: output
      }]);
      return;
    }

    try {
      const res = await fetch(`${BACKEND.baseUrl}${BACKEND.endpoints.terminalCommand}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, args })
      });

      if (res.ok) {
        const data = await res.json();
        setHistory(prev => [...prev, {
          type: data.success ? 'output' : 'error',
          content: data.output
        }]);
      } else {
        setHistory(prev => [...prev, {
          type: 'error',
          content: 'Failed to execute command'
        }]);
      }
    } catch (e) {
      setHistory(prev => [...prev, {
        type: 'error',
        content: `Connection error: ${e.message}`
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(inputValue);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };

  const getLineColor = (type) => {
    switch (type) {
      case 'input': return themeColor;
      case 'error': return '#ff6b6b';
      case 'system': return 'rgba(255,255,255,0.4)';
      default: return 'rgba(255,255,255,0.85)';
    }
  };

  return (
    <WindowFrame
      isOpen={isOpen}
      position={position}
      size={size}
      isDragging={isDragging}
      onMouseDown={handleMouseDown}
      onResizeMouseDown={handleResizeMouseDown}
      onClose={onClose}
      title="DNA Terminal"
      badge={history.length}
      themeColor={themeColor}
      fontFamily='"JetBrains Mono", "Fira Code", "Consolas", monospace'
      onClick={() => inputRef.current?.focus()}
      contentStyle={{ display: 'flex', flexDirection: 'column' }}
    >
      <div ref={terminalRef} className="terminal-content" style={{
        flex: 1, overflow: 'auto', padding: '16px',
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent'
      }}>
        {history.map((line, i) => (
          <div key={i} style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: getLineColor(line.type),
            marginBottom: '6px',
            lineHeight: 1.6
          }}>
            {line.content}
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <span style={{ color: themeColor, fontWeight: 600 }}>{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'rgba(255,255,255,0.9)',
            fontFamily: 'inherit',
            fontSize: '13px',
            caretColor: themeColor
          }}
        />
      </div>
    </WindowFrame>
  );
}
