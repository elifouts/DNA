import { useCallback, useState, useEffect } from 'react';
import { VISUAL_DEFAULTS, VISUAL_PRESETS, WINDOW_DEFAULTS, BACKEND } from '../config/appDefaults';
import useFloatingWindow from '../hooks/useFloatingWindow';
import WindowFrame, { WindowActionButton } from './WindowFrame';

/**
 * VisualizationWindow - Comprehensive DNA Visualization settings
 * All settings are saveable to localStorage and persist across restarts
 * Includes AI control toggles for when backend is connected
 */

// SliderRow component with value display
function SliderRow({ label, value, min, max, step, onChange, themeColor, disabled = false, integer = false }) {
  const displayValue = integer ? Math.round(value) : (typeof value === 'number' ? value.toFixed(2) : value);
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 12, 
      marginBottom: 8,
      opacity: disabled ? 0.5 : 1
    }}>
      <span style={{ flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(integer ? parseInt(e.target.value) : parseFloat(e.target.value))}
        style={{
          width: 100,
          accentColor: themeColor,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      />
      <span style={{
        width: 42,
        fontSize: '11px',
        color: themeColor,
        textAlign: 'right',
        fontFamily: 'monospace'
      }}>{displayValue}</span>
    </div>
  );
}

// Section component with collapsible option
function Section({ title, children, themeColor, defaultOpen = true, badge = null }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 10,
      marginBottom: 10,
      overflow: 'hidden'
    }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          color: themeColor,
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.01)',
          borderBottom: isOpen ? '1px solid rgba(255,255,255,0.03)' : 'none'
        }}
      >
        <span style={{
          width: 4,
          height: 12,
          background: `linear-gradient(180deg, ${themeColor}, transparent)`,
          borderRadius: 2
        }} />
        <span style={{ flex: 1 }}>{title}</span>
        {badge && (
          <span style={{
            fontSize: '9px',
            padding: '2px 6px',
            background: `${themeColor}30`,
            borderRadius: 4,
            color: themeColor
          }}>{badge}</span>
        )}
        <span style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          fontSize: '10px'
        }}>▼</span>
      </div>
      {isOpen && (
        <div style={{ padding: '12px 14px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ActionButton component
function ActionButton({ onClick, children, themeColor, primary = false, small = false, danger = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: small ? '5px 10px' : '8px 14px',
        background: danger ? 'rgba(255,80,80,0.2)' : primary ? `${themeColor}30` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${danger ? 'rgba(255,80,80,0.4)' : primary ? themeColor + '50' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 8,
        color: danger ? '#ff6666' : primary ? themeColor : 'rgba(255,255,255,0.7)',
        cursor: 'pointer',
        fontSize: small ? '10px' : '11px',
        fontWeight: 500,
        transition: 'all 0.15s',
        fontFamily: 'inherit'
      }}
    >
      {children}
    </button>
  );
}

// ToggleRow component with description
function ToggleRow({ label, description, checked, onChange, themeColor, aiControlled = false }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      gap: 12, 
      marginBottom: 10,
      opacity: aiControlled ? 0.6 : 1
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ 
          color: 'rgba(255,255,255,0.8)', 
          fontSize: '12px', 
          marginBottom: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          {label}
          {aiControlled && (
            <span style={{
              fontSize: '8px',
              padding: '1px 4px',
              background: 'rgba(255,180,0,0.2)',
              borderRadius: 3,
              color: '#ffb400'
            }}>AI</span>
          )}
        </div>
        {description && (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{description}</div>
        )}
      </div>
      <button
        onClick={onChange}
        style={{
          width: 38,
          height: 20,
          borderRadius: 10,
          border: 'none',
          background: checked ? themeColor : 'rgba(255,255,255,0.1)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0
        }}
      >
        <div style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          background: 'white',
          position: 'absolute',
          top: 3,
          left: checked ? 21 : 3,
          transition: 'left 0.2s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );
}

export default function VisualizationWindow({ 
  isOpen, 
  onClose, 
  themeColor = VISUAL_DEFAULTS.theme.hex, 
  vizParams, 
  setVizParams, 
  onSaveDefaults, 
  onResetDefaults,
  onRefreshViz
}) {
  const presets = Object.values(VISUAL_PRESETS);
  const [saveStatus, setSaveStatus] = useState(null);
  
  const { position, size, isDragging, handleMouseDown, handleResizeMouseDown } = useFloatingWindow({
    initialPosition: WINDOW_DEFAULTS.layout.visualization.position,
    initialSize: { width: 500, height: 720 },
    minSize: WINDOW_DEFAULTS.layout.visualization.minSize
  });

  const handleVizParamChange = useCallback((param, value) => {
    setVizParams(prev => ({ ...prev, [param]: value }));
  }, [setVizParams]);
  
  const handleSaveDefaults = useCallback(() => {
    if (onSaveDefaults) {
      onSaveDefaults();
      setSaveStatus('✓ Saved to browser storage!');
      setTimeout(() => setSaveStatus(null), 2500);
    }
  }, [onSaveDefaults]);
  
  const handleResetDefaults = useCallback(() => {
    if (onResetDefaults) {
      onResetDefaults();
      setSaveStatus('↺ Reset to defaults');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  }, [onResetDefaults]);
  
  // Check if AI controls are enabled for a parameter category
  const isAiControlled = (category) => {
    if (!BACKEND.enabled) return false;
    switch (category) {
      case 'rotation': return vizParams.aiControlsRotation;
      case 'pulse': return vizParams.aiControlsPulse;
      case 'intensity': return vizParams.aiControlsIntensity;
      case 'color': return vizParams.aiControlsColor;
      case 'movement': return vizParams.aiControlsMovement;
      default: return false;
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
      title="Visualization Settings"
      themeColor={themeColor}
      actions={(
        <>
          <WindowActionButton onClick={handleSaveDefaults} themeColor={themeColor} variant="primary">
            💾 Save
          </WindowActionButton>
          <WindowActionButton onClick={handleResetDefaults} themeColor={themeColor}>
            ↺ Reset
          </WindowActionButton>
        </>
      )}
      footer={saveStatus ? (
        <span style={{ color: themeColor }}>{saveStatus}</span>
      ) : (
        <span>Settings auto-apply • Save to persist across restarts</span>
      )}
      contentStyle={{
        overflow: 'auto',
        padding: '12px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.1) transparent'
      }}
    >
      <div>
        {/* Quick Presets */}
        <Section title="Quick Presets" themeColor={themeColor}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            {presets.slice(0, 6).map((preset) => (
              <ActionButton
                key={preset.label}
                onClick={() => setVizParams(prev => ({ ...prev, ...preset.params }))}
                themeColor={themeColor}
                small
              >
                {preset.icon} {preset.label}
              </ActionButton>
            ))}
          </div>
        </Section>

        {/* Volume Cloud Parameters */}
        <Section title="Volume Cloud" themeColor={themeColor} defaultOpen={true}>
          <div style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 12,
            padding: '8px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 6
          }}>
            Controls for the volumetric cloud visualization using 3D Perlin noise and ray marching.
          </div>
          <SliderRow
            label="Threshold"
            value={vizParams.threshold ?? 0.25}
            min={0.0} max={1.0} step={0.01}
            onChange={(v) => handleVizParamChange('threshold', v)}
            themeColor={themeColor}
          />
          <SliderRow
            label="Opacity"
            value={vizParams.opacity ?? 0.25}
            min={0.0} max={1.0} step={0.01}
            onChange={(v) => handleVizParamChange('opacity', v)}
            themeColor={themeColor}
          />
          <SliderRow
            label="Range"
            value={vizParams.range ?? 0.1}
            min={0.0} max={0.5} step={0.01}
            onChange={(v) => handleVizParamChange('range', v)}
            themeColor={themeColor}
          />
          <SliderRow
            label="Ray Steps"
            value={vizParams.steps ?? 100}
            min={10} max={200} step={5}
            onChange={(v) => handleVizParamChange('steps', v)}
            themeColor={themeColor}
            integer
          />
        </Section>

        {/* AI Control Toggles */}
        <Section title="AI Control" themeColor={themeColor} badge={BACKEND.enabled ? "LIVE" : "OFF"} defaultOpen={false}>
          <div style={{ 
            fontSize: '10px', 
            color: 'rgba(255,255,255,0.5)', 
            marginBottom: 12,
            padding: '8px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 6
          }}>
            Placeholders for AI backend integration. When enabled + backend connected, AI can override these settings.
          </div>
          <ToggleRow
            label="AI Controls Rotation"
            description="Let AI adjust rotation speed and tilt"
            checked={vizParams.aiControlsRotation ?? false}
            onChange={() => handleVizParamChange('aiControlsRotation', !vizParams.aiControlsRotation)}
            themeColor={themeColor}
          />
          <ToggleRow
            label="AI Controls Pulse"
            description="Let AI adjust pulse and breathing"
            checked={vizParams.aiControlsPulse ?? false}
            onChange={() => handleVizParamChange('aiControlsPulse', !vizParams.aiControlsPulse)}
            themeColor={themeColor}
          />
          <ToggleRow
            label="AI Controls Intensity"
            description="Let AI adjust brightness and glow"
            checked={vizParams.aiControlsIntensity ?? false}
            onChange={() => handleVizParamChange('aiControlsIntensity', !vizParams.aiControlsIntensity)}
            themeColor={themeColor}
          />
          <ToggleRow
            label="AI Controls Colors"
            description="Let AI change color mode"
            checked={vizParams.aiControlsColor ?? false}
            onChange={() => handleVizParamChange('aiControlsColor', !vizParams.aiControlsColor)}
            themeColor={themeColor}
          />
          <ToggleRow
            label="AI Controls Movement"
            description="Let AI adjust organic movement"
            checked={vizParams.aiControlsMovement ?? false}
            onChange={() => handleVizParamChange('aiControlsMovement', !vizParams.aiControlsMovement)}
            themeColor={themeColor}
          />
        </Section>

        {/* Motion Settings */}
        <Section title="Motion" themeColor={themeColor} badge={isAiControlled('rotation') ? 'AI' : null}>
          <SliderRow
            label="Rotation Speed"
            value={vizParams.rotationSpeed ?? 0.08}
            min={0} max={0.3} step={0.01}
            onChange={(v) => handleVizParamChange('rotationSpeed', v)}
            themeColor={themeColor}
            disabled={isAiControlled('rotation')}
          />
          <SliderRow
            label="Tilt Amount"
            value={vizParams.tilt ?? 0.06}
            min={0} max={0.2} step={0.01}
            onChange={(v) => handleVizParamChange('tilt', v)}
            themeColor={themeColor}
            disabled={isAiControlled('rotation')}
          />
          <SliderRow
            label="Breathing"
            value={vizParams.breathing ?? 0.03}
            min={0} max={0.1} step={0.005}
            onChange={(v) => handleVizParamChange('breathing', v)}
            themeColor={themeColor}
            disabled={isAiControlled('pulse')}
          />
          <SliderRow
            label="Pulse Intensity"
            value={vizParams.pulse ?? 0.3}
            min={0} max={0.6} step={0.02}
            onChange={(v) => handleVizParamChange('pulse', v)}
            themeColor={themeColor}
            disabled={isAiControlled('pulse')}
          />
          <SliderRow
            label="Alive Factor"
            value={vizParams.aliveFactor ?? 1.0}
            min={0.2} max={2.0} step={0.1}
            onChange={(v) => handleVizParamChange('aliveFactor', v)}
            themeColor={themeColor}
            disabled={isAiControlled('movement')}
          />
        </Section>

        {/* Node Appearance */}
        <Section title="Node Appearance" themeColor={themeColor} badge={isAiControlled('intensity') ? 'AI' : null}>
          <SliderRow
            label="Node Size"
            value={vizParams.nodeSize ?? 1.0}
            min={0.3} max={2.5} step={0.1}
            onChange={(v) => handleVizParamChange('nodeSize', v)}
            themeColor={themeColor}
          />
          <SliderRow
            label="Core Size"
            value={vizParams.nodeBaseSize ?? 0.45}
            min={0.1} max={1.0} step={0.05}
            onChange={(v) => handleVizParamChange('nodeBaseSize', v)}
            themeColor={themeColor}
          />
          <SliderRow
            label="Glow Size"
            value={vizParams.glowSize ?? 1.6}
            min={0.5} max={3.0} step={0.1}
            onChange={(v) => handleVizParamChange('glowSize', v)}
            themeColor={themeColor}
          />
          <SliderRow
            label="Inner Glow Size"
            value={vizParams.innerGlowSize ?? 0.9}
            min={0.3} max={2.0} step={0.1}
            onChange={(v) => handleVizParamChange('innerGlowSize', v)}
            themeColor={themeColor}
          />
          <SliderRow
            label="Brightness"
            value={vizParams.intensity ?? 0.7}
            min={0.2} max={1.5} step={0.05}
            onChange={(v) => handleVizParamChange('intensity', v)}
            themeColor={themeColor}
            disabled={isAiControlled('intensity')}
          />
          <SliderRow
            label="Bloom Intensity"
            value={vizParams.bloomIntensity ?? 0.35}
            min={0} max={1.0} step={0.05}
            onChange={(v) => handleVizParamChange('bloomIntensity', v)}
            themeColor={themeColor}
            disabled={isAiControlled('intensity')}
          />
          <SliderRow
            label="Outer Glow Opacity"
            value={vizParams.glowOpacity ?? 0.25}
            min={0} max={0.8} step={0.05}
            onChange={(v) => handleVizParamChange('glowOpacity', v)}
            themeColor={themeColor}
          />
          <SliderRow
            label="Inner Glow Opacity"
            value={vizParams.innerGlowOpacity ?? 0.35}
            min={0} max={0.8} step={0.05}
            onChange={(v) => handleVizParamChange('innerGlowOpacity', v)}
            themeColor={themeColor}
          />
          <SliderRow
            label="Core Opacity"
            value={vizParams.coreOpacity ?? 0.9}
            min={0.3} max={1.0} step={0.05}
            onChange={(v) => handleVizParamChange('coreOpacity', v)}
            themeColor={themeColor}
          />
        </Section>

        {/* Connection/Link Settings */}
        <Section title="Connections" themeColor={themeColor}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: 6 }}>Connection Style</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { key: 'line', icon: '━', label: 'Straight' },
                { key: 'bezier', icon: '⌒', label: 'Bezier' },
                { key: 'curved', icon: '〰', label: 'Curved' }
              ].map(style => (
                <ActionButton
                  key={style.key}
                  onClick={() => handleVizParamChange('connectionStyle', style.key)}
                  themeColor={vizParams.connectionStyle === style.key ? themeColor : 'rgba(255,255,255,0.2)'}
                  primary={vizParams.connectionStyle === style.key}
                  small
                >
                  {style.icon} {style.label}
                </ActionButton>
              ))}
            </div>
          </div>
          <SliderRow
            label="Link Opacity"
            value={vizParams.linkOpacity ?? 0.5}
            min={0.1} max={1.0} step={0.05}
            onChange={(v) => handleVizParamChange('linkOpacity', v)}
            themeColor={themeColor}
          />
          <SliderRow
            label="Link Curvature"
            value={vizParams.linkCurvature ?? 0.35}
            min={0} max={1.0} step={0.05}
            onChange={(v) => handleVizParamChange('linkCurvature', v)}
            themeColor={themeColor}
          />
          <SliderRow
            label="Curve Quality"
            value={vizParams.linkSegments ?? 24}
            min={8} max={48} step={4}
            onChange={(v) => handleVizParamChange('linkSegments', v)}
            themeColor={themeColor}
            integer
          />
          <SliderRow
            label="Flow Speed"
            value={vizParams.linkFlowSpeed ?? 2.0}
            min={0} max={6.0} step={0.2}
            onChange={(v) => handleVizParamChange('linkFlowSpeed', v)}
            themeColor={themeColor}
          />
          <SliderRow
            label="Flow Intensity"
            value={vizParams.linkFlowIntensity ?? 0.35}
            min={0} max={1.0} step={0.05}
            onChange={(v) => handleVizParamChange('linkFlowIntensity', v)}
            themeColor={themeColor}
          />
        </Section>

        {/* Color Mode */}
        <Section title="Color Mode" themeColor={themeColor} badge={isAiControlled('color') ? 'AI' : null}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { key: 'activity', icon: '⚡', label: 'Activity' },
              { key: 'flow', icon: '🌊', label: 'Flow' },
              { key: 'energy', icon: '✨', label: 'Energy' },
              { key: 'age', icon: '🕐', label: 'Age' },
              { key: 'type', icon: '🏷️', label: 'Type' }
            ].map(mode => (
              <ActionButton
                key={mode.key}
                onClick={() => !isAiControlled('color') && handleVizParamChange('colorMode', mode.key)}
                themeColor={vizParams.colorMode === mode.key ? themeColor : 'rgba(255,255,255,0.2)'}
                primary={vizParams.colorMode === mode.key}
                small
              >
                {mode.icon} {mode.label}
              </ActionButton>
            ))}
          </div>
        </Section>

        {/* Organic Movement */}
        <Section title="Organic Movement" themeColor={themeColor} badge={isAiControlled('movement') ? 'AI' : null} defaultOpen={false}>
          <SliderRow
            label="Node Drift"
            value={vizParams.nodeDrift ?? 0.25}
            min={0} max={1.0} step={0.05}
            onChange={(v) => handleVizParamChange('nodeDrift', v)}
            themeColor={themeColor}
            disabled={isAiControlled('movement')}
          />
          <SliderRow
            label="Sync Factor"
            value={vizParams.syncFactor ?? 0.7}
            min={0} max={1.0} step={0.05}
            onChange={(v) => handleVizParamChange('syncFactor', v)}
            themeColor={themeColor}
            disabled={isAiControlled('movement')}
          />
          <SliderRow
            label="Energy Ripple"
            value={vizParams.energyRipple ?? 0.4}
            min={0} max={1.0} step={0.05}
            onChange={(v) => handleVizParamChange('energyRipple', v)}
            themeColor={themeColor}
          />
          
          <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: 8, textTransform: 'uppercase' }}>
              Wave Effects
            </div>
            <ToggleRow
              label="Helix Wave"
              description="Vertical wave motion along helix"
              checked={vizParams.helixWaveEnabled ?? true}
              onChange={() => handleVizParamChange('helixWaveEnabled', !(vizParams.helixWaveEnabled ?? true))}
              themeColor={themeColor}
            />
            {(vizParams.helixWaveEnabled ?? true) && (
              <>
                <SliderRow
                  label="Wave Amplitude"
                  value={vizParams.helixWaveAmplitude ?? 0.5}
                  min={0} max={1.5} step={0.1}
                  onChange={(v) => handleVizParamChange('helixWaveAmplitude', v)}
                  themeColor={themeColor}
                />
                <SliderRow
                  label="Wave Speed"
                  value={vizParams.helixWaveSpeed ?? 0.8}
                  min={0.1} max={2.0} step={0.1}
                  onChange={(v) => handleVizParamChange('helixWaveSpeed', v)}
                  themeColor={themeColor}
                />
              </>
            )}
            
            <ToggleRow
              label="Radial Breathing"
              description="Nodes expand/contract radially"
              checked={vizParams.radialBreathingEnabled ?? true}
              onChange={() => handleVizParamChange('radialBreathingEnabled', !(vizParams.radialBreathingEnabled ?? true))}
              themeColor={themeColor}
            />
            {(vizParams.radialBreathingEnabled ?? true) && (
              <SliderRow
                label="Breathing Amplitude"
                value={vizParams.radialBreathingAmplitude ?? 0.4}
                min={0} max={1.0} step={0.05}
                onChange={(v) => handleVizParamChange('radialBreathingAmplitude', v)}
                themeColor={themeColor}
              />
            )}
            
            <ToggleRow
              label="Twist Dynamics"
              description="Organic twist variation"
              checked={vizParams.twistDynamicsEnabled ?? true}
              onChange={() => handleVizParamChange('twistDynamicsEnabled', !(vizParams.twistDynamicsEnabled ?? true))}
              themeColor={themeColor}
            />
            {(vizParams.twistDynamicsEnabled ?? true) && (
              <SliderRow
                label="Twist Amplitude"
                value={vizParams.twistDynamicsAmplitude ?? 0.3}
                min={0} max={0.8} step={0.05}
                onChange={(v) => handleVizParamChange('twistDynamicsAmplitude', v)}
                themeColor={themeColor}
              />
            )}
            
            <ToggleRow
              label="Shape Morphing"
              description="Complex organic deformation"
              checked={vizParams.shapeMorphingEnabled ?? true}
              onChange={() => handleVizParamChange('shapeMorphingEnabled', !(vizParams.shapeMorphingEnabled ?? true))}
              themeColor={themeColor}
            />
            {(vizParams.shapeMorphingEnabled ?? true) && (
              <SliderRow
                label="Morph Amplitude"
                value={vizParams.shapeMorphingAmplitude ?? 0.35}
                min={0} max={1.0} step={0.05}
                onChange={(v) => handleVizParamChange('shapeMorphingAmplitude', v)}
                themeColor={themeColor}
              />
            )}
          </div>
        </Section>

        {/* Display Options */}
        <Section title="Display Options" themeColor={themeColor} defaultOpen={false}>
          <ToggleRow
            label="Show Node Labels"
            description="Display labels on nodes (impacts performance)"
            checked={vizParams.showLabels ?? false}
            onChange={() => handleVizParamChange('showLabels', !(vizParams.showLabels ?? false))}
            themeColor={themeColor}
          />
        </Section>

        {/* Save/Reset Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          marginTop: 12,
          padding: '12px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.05)',
          flexWrap: 'wrap'
        }}>
          <ActionButton onClick={handleSaveDefaults} themeColor={themeColor} primary>
            💾 Save Settings
          </ActionButton>
          <ActionButton onClick={handleResetDefaults} themeColor={themeColor}>
            ↺ Reset All
          </ActionButton>
          <ActionButton onClick={onRefreshViz} themeColor={themeColor}>
            🔄 Refresh View
          </ActionButton>
        </div>
        
        <div style={{ 
          fontSize: '10px', 
          color: 'rgba(255,255,255,0.3)', 
          textAlign: 'center',
          marginTop: 10 
        }}>
          Settings are saved to browser localStorage and persist across restarts
        </div>
      </div>
    </WindowFrame>
  );
}
