import React, { useState } from 'react';
import { X, Terminal, Trash2, ArrowUpRight, ArrowDownLeft, Radio, Activity } from 'lucide-react';

export function TelemetryLogModal({ isOpen, onClose, logs, onClear }) {
  const [filter, setFilter] = useState('ALL');

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.type.toUpperCase() === filter;
  });

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" id="modal-title">
            <Terminal size={18} className="accent-blue" />
            <span>WebSocket & Telemetry Log Inspector</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClear} title="Clear log history">
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} aria-label="Close modal">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Log Filter Pills */}
        <div style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'SENT', 'RECEIVED', 'ANALYTICS'].map(f => (
            <button
              key={f}
              type="button"
              className="btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderColor: filter === f ? 'var(--accent-blue)' : 'var(--border-medium)',
                background: filter === f ? 'var(--accent-blue-bg)' : 'transparent',
                color: filter === f ? 'var(--accent-blue)' : 'var(--text-secondary)'
              }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {filteredLogs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No log events captured yet. Perform actions on tickets to record socket frame traffic.
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={idx} className={`log-entry ${log.type.toLowerCase()}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.75rem' }}>
                    {log.type === 'SENT' && <ArrowUpRight size={12} style={{ color: 'var(--accent-blue)' }} />}
                    {log.type === 'RECEIVED' && <ArrowDownLeft size={12} style={{ color: 'var(--accent-emerald)' }} />}
                    {log.type === 'ANALYTICS' && <Activity size={12} style={{ color: 'var(--accent-purple)' }} />}
                    {log.type === 'SYSTEM' && <Radio size={12} style={{ color: 'var(--accent-amber)' }} />}
                    <span>[{log.type}]</span>
                  </span>
                  <span className="log-time">{log.time}</span>
                </div>
                <div className="log-msg">
                  {typeof log.payload === 'object' ? JSON.stringify(log.payload, null, 2) : log.payload}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
