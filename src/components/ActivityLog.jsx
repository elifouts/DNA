import { useState, useEffect, useRef } from 'react';
import { BACKEND, VISUAL_DEFAULTS, WINDOW_DEFAULTS } from '../config/appDefaults';
import useFloatingWindow from '../hooks/useFloatingWindow';
import WindowFrame from './WindowFrame';

/**
 * ActivityLog - Glassy Hyprland-style draggable activity window
 * Matches TerminalWindow styling
 */
export default function ActivityLog({ isOpen, onClose, themeColor = VISUAL_DEFAULTS.theme.hex, activities: propActivities = null }) {
  const [activities, setActivities] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const logRef = useRef(null);
  const { position, size, isDragging, handleMouseDown, handleResizeMouseDown } = useFloatingWindow({
    initialPosition: WINDOW_DEFAULTS.layout.activity.position,
    initialSize: WINDOW_DEFAULTS.layout.activity.size,
    minSize: WINDOW_DEFAULTS.layout.activity.minSize
  });

  // Filter type mapping for API - matches actual event types in database
  const filterTypeMap = {
    'all': null,
    'learning': 'words_learned',
    'thoughts': 'thought_written',
    'autonomous': 'autonomous_learn',
    'reset': 'full_reset',
  };

  // Use provided activities when running in mock mode
  useEffect(() => {
    if (!isOpen) return;
    if (Array.isArray(propActivities)) {
      setActivities(propActivities);
    }
  }, [propActivities, isOpen]);

  // Fetch activities periodically (only when no mock data is provided)
  useEffect(() => {
    if (!isOpen || Array.isArray(propActivities) || !BACKEND.enabled) return;

    const fetchActivities = async () => {
      try {
        const apiType = filterTypeMap[activeFilter];
        const typeParam = apiType ? `&type=${apiType}` : '';
        const res = await fetch(`${BACKEND.baseUrl}${BACKEND.endpoints.activity}?limit=100${typeParam}`);
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
        }
      } catch (e) {
        console.error('Failed to fetch activities:', e);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 1500);
    return () => clearInterval(interval);
  }, [isOpen, activeFilter, propActivities]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [activities]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getEventIcon = (type) => {
    // No emojis - use simple symbols
    const icons = {
      'words_learned': '+',
      'thought_written': '*',
      'autonomous_learn': '>',
      'learned_response_pattern': '~',
      'full_reset': '!',
    };
    return icons[type] || '-';
  };

  const formatDetails = (type, details) => {
    if (!details) return '';
    try {
      const d = typeof details === 'string' ? JSON.parse(details) : details;
      switch (type) {
        case 'words_learned':
          return `+${d.count || 0} words (total: ${d.total || 0})`;
        case 'thought_written':
          return d.thought?.substring(0, 60) || 'Thought recorded';
        case 'autonomous_learn':
          return d.tool || d.topic || d.query?.substring(0, 50) || 'Autonomous learning';
        case 'learned_response_pattern':
          return d.pattern_type || 'Pattern learned';
        case 'full_reset':
          return 'Network reset to initial state';
        default:
          const str = JSON.stringify(d);
          return str.length > 60 ? str.substring(0, 60) + '...' : str;
      }
    } catch {
      return String(details).substring(0, 60);
    }
  };

  const getEventColor = (type) => {
    const colors = {
      'words_learned': '#74c0fc',
      'thought_written': '#da77f2',
      'autonomous_learn': '#ffd43b',
      'learned_response_pattern': '#20c997',
      'full_reset': '#ff6b6b',
    };
    return colors[type] || 'rgba(255,255,255,0.6)';
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'learning', label: 'Words' },
    { id: 'thoughts', label: 'Thoughts' },
    { id: 'autonomous', label: 'Auto' },
    { id: 'reset', label: 'Resets' },
  ];

  const visibleActivities = activeFilter === 'all'
    ? activities
    : activities.filter(activity => activity.event_type === filterTypeMap[activeFilter]);

  return (
    <WindowFrame
      isOpen={isOpen}
      position={position}
      size={size}
      isDragging={isDragging}
      onMouseDown={handleMouseDown}
      onResizeMouseDown={handleResizeMouseDown}
      onClose={onClose}
      title="Activity Log"
      badge={activities.length}
      themeColor={themeColor}
      fontFamily='"JetBrains Mono", "Fira Code", monospace'
      contentStyle={{ display: 'flex', flexDirection: 'column' }}
      footer={(
        <>
          <span>Filter: {activeFilter}</span>
          <span>↻ 1.5s</span>
        </>
      )}
    >
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(255,255,255,0.01)'
      }}>
        {filters.map(f => (
          <button
            key={f.id}
            className="filter-btn"
            onClick={() => setActiveFilter(f.id)}
            style={{
              background: activeFilter === f.id
                ? `linear-gradient(135deg, ${themeColor}40, ${themeColor}20)`
                : 'rgba(255,255,255,0.04)',
              border: activeFilter === f.id
                ? `1px solid ${themeColor}50`
                : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              color: activeFilter === f.id ? themeColor : 'rgba(255,255,255,0.5)',
              fontSize: '11px',
              padding: '5px 12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontWeight: activeFilter === f.id ? 500 : 400,
              boxShadow: activeFilter === f.id
                ? `0 0 12px ${themeColor}25, inset 0 1px 0 rgba(255,255,255,0.1)`
                : 'none'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div
        ref={logRef}
        className="activity-content"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '10px 14px',
          lineHeight: 1.5,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.08) transparent'
        }}
      >
        {visibleActivities.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.15)', fontStyle: 'italic', textAlign: 'center', padding: '40px' }}>
            No activity yet...
          </div>
        ) : (
          [...visibleActivities].reverse().map((activity, i) => (
            <div
              key={`${activity.timestamp}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '6px 8px',
                marginBottom: '2px',
                borderRadius: '6px',
                background: i === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                transition: 'background 0.15s'
              }}
            >
              <span style={{
                color: 'rgba(255,255,255,0.25)',
                flexShrink: 0,
                fontSize: '10px',
                fontFamily: 'monospace',
                marginTop: '2px'
              }}>
                {formatTime(activity.timestamp)}
              </span>
              <span style={{
                flexShrink: 0,
                fontSize: '12px'
              }}>
                {getEventIcon(activity.event_type)}
              </span>
              <span style={{
                color: getEventColor(activity.event_type),
                fontSize: '11px',
                lineHeight: 1.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                opacity: 0.85
              }}>
                {formatDetails(activity.event_type, activity.details)}
              </span>
            </div>
          ))
        )}
      </div>
    </WindowFrame>
  );
}
