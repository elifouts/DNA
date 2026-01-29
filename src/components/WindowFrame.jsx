import { motion } from 'framer-motion'
import { WINDOW_DEFAULTS, VISUAL_DEFAULTS } from '../config/appDefaults'

export function WindowActionButton({ children, onClick, themeColor, variant = 'ghost' }) {
  const styles = WINDOW_DEFAULTS.actionButton
  const isPrimary = variant === 'primary'

  return (
    <button
      data-window-ignore-drag
      onClick={onClick}
      style={{
        ...styles.base,
        background: isPrimary ? `${themeColor}30` : styles.base.background,
        border: `1px solid ${isPrimary ? `${themeColor}55` : styles.base.borderColor}`,
        color: isPrimary ? themeColor : styles.base.color
      }}
    >
      {children}
    </button>
  )
}

export default function WindowFrame({
  isOpen,
  position,
  size,
  isDragging,
  onMouseDown,
  onResizeMouseDown,
  onClose,
  title,
  badge,
  themeColor = VISUAL_DEFAULTS.theme.hex,
  actions,
  footer,
  children,
  onClick,
  contentClassName,
  contentStyle,
  windowStyle,
  fontFamily
}) {
  if (!isOpen) return null

  const styles = WINDOW_DEFAULTS

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 18 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        background: styles.glass.background,
        backdropFilter: styles.glass.backdropFilter,
        WebkitBackdropFilter: styles.glass.backdropFilter,
        border: styles.glass.border,
        borderRadius: styles.glass.borderRadius,
        fontFamily: fontFamily || styles.fontFamily,
        fontSize: styles.fontSize,
        zIndex: styles.zIndex,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: styles.glass.shadow.replace('{themeColor}', themeColor),
        overflow: 'hidden',
        userSelect: isDragging ? 'none' : 'auto',
        ...windowStyle
      }}
    >
      <div
        onMouseDown={onMouseDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: styles.titleBar.padding,
          background: styles.titleBar.background,
          borderBottom: styles.titleBar.borderBottom,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}88)`,
              boxShadow: `0 0 12px ${themeColor}55`
            }}
          />
          <span
            style={{
              color: styles.titleBar.titleColor,
              fontSize: styles.titleBar.titleSize,
              fontWeight: styles.titleBar.titleWeight
            }}
          >
            {title}
          </span>
          {badge !== undefined && badge !== null && (
            <span
              style={{
                color: styles.badge.color,
                fontSize: styles.badge.fontSize,
                background: styles.badge.background,
                padding: styles.badge.padding,
                borderRadius: styles.badge.borderRadius
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} data-window-ignore-drag>
          {actions}
          <button
            data-window-ignore-drag
            onClick={onClose}
            style={{
              width: styles.closeButton.size,
              height: styles.closeButton.size,
              borderRadius: styles.closeButton.borderRadius,
              border: styles.closeButton.border,
              background: styles.closeButton.background,
              color: styles.closeButton.color,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: styles.closeButton.fontSize,
              transition: 'all 0.15s'
            }}
          >
            ×
          </button>
        </div>
      </div>

      <div
        className={contentClassName}
        style={{
          flex: 1,
          overflow: 'hidden',
          ...contentStyle
        }}
      >
        {children}
      </div>

      {footer && (
        <div
          style={{
            padding: styles.footer.padding,
            background: styles.footer.background,
            borderTop: styles.footer.borderTop,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: styles.footer.fontSize,
            color: styles.footer.color
          }}
        >
          {footer}
        </div>
      )}

      <div
        className="resize-handle"
        data-window-ignore-drag
        onMouseDown={onResizeMouseDown}
        style={{
          position: 'absolute',
          right: 4,
          bottom: 4,
          width: 16,
          height: 16,
          cursor: 'se-resize',
          color: styles.resizeHandle.color
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M11 1L1 11M11 6L6 11M11 11L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </motion.div>
  )
}
