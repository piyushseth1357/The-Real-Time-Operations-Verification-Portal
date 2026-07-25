import React from 'react';
import { Activity, Wifi, WifiOff, RefreshCw, Terminal, Layers } from 'lucide-react';

export function Header({ 
  connectionStatus, 
  isOfflineSimulated, 
  onToggleOffline, 
  onOpenLogs, 
  onResetTasks,
  logCount 
}) {
  const { state, message, readyState } = connectionStatus;

  return (
    <header className="site-header" role="banner">
      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-logo" aria-hidden="true">
            <Layers size={22} />
          </div>
          <div>
            <div className="header-title">
              Real-Time Verification Portal
              <span className="ticket-badge">ENG-149206</span>
            </div>
            <div className="header-subtitle">
              Field Operations Workflow • Epic: Core Infrastructure Overhaul & Real-Time Sync
            </div>
          </div>
        </div>

        <div className="header-controls">
          {/* Connection Status Badge */}
          <div 
            className={`status-pill ${state.toLowerCase()}`}
            role="status" 
            aria-live="polite"
            data-tooltip={message}
          >
            <span className="status-dot" aria-hidden="true"></span>
            <span>
              {state === 'OPEN' && 'ONLINE (WSS CONNECTED)'}
              {state === 'CONNECTING' && 'RECONNECTING...'}
              {state === 'CLOSED' && (isOfflineSimulated ? 'SIMULATED OFFLINE' : 'DISCONNECTED')}
            </span>
          </div>

          {/* Toggle Offline Simulation Button */}
          <button
            type="button"
            className="btn-secondary"
            onClick={onToggleOffline}
            aria-label={isOfflineSimulated ? 'Re-establish network connection' : 'Simulate network disconnect'}
          >
            {isOfflineSimulated ? <Wifi size={14} className="accent-emerald" /> : <WifiOff size={14} />}
            <span>{isOfflineSimulated ? 'Reconnect Network' : 'Simulate Offline'}</span>
          </button>

          {/* View Telemetry Logs Button */}
          <button
            type="button"
            className="btn-secondary"
            onClick={onOpenLogs}
            aria-label="Open telemetry and socket frame inspector log"
          >
            <Terminal size={14} />
            <span>Telemetry</span>
            {logCount > 0 && (
              <span className="column-count" style={{ marginLeft: '4px' }}>
                {logCount}
              </span>
            )}
          </button>

          {/* Reset Tasks Button */}
          <button
            type="button"
            className="btn-secondary"
            onClick={onResetTasks}
            aria-label="Reset tasks to initial state"
            title="Reset task pipeline for testing"
          >
            <RefreshCw size={14} />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </header>
  );
}
