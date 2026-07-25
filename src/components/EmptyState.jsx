import React from 'react';
import { Sparkles, CheckCheck } from 'lucide-react';

export function EmptyState({ title, subtitle, onReset }) {
  return (
    <div className="empty-state" role="status" aria-label={title}>
      <div className="empty-icon-wrapper">
        <CheckCheck size={28} />
      </div>
      <h3 className="empty-title">{title || "All caught up! 🎉"}</h3>
      <p className="empty-sub">{subtitle || "No pending verification tickets require your attention."}</p>

      {onReset && (
        <button 
          type="button" 
          className="btn-secondary" 
          onClick={onReset}
          style={{ marginTop: '1rem' }}
        >
          <Sparkles size={14} />
          <span>Reload Sample Tickets</span>
        </button>
      )}
    </div>
  );
}
