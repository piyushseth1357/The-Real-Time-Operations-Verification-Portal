import React from 'react';
import { CheckCircle2, XCircle, Play, User, Clock } from 'lucide-react';

export function TaskCard({ 
  task, 
  onStatusChange, 
  wsReadyState, 
  updatingTaskId 
}) {
  const isConnected = wsReadyState === WebSocket.OPEN;
  const isUpdating = updatingTaskId === task.id;

  const handleAction = (newStatus) => {
    if (!isConnected) return;
    onStatusChange(task.id, newStatus);
  };

  const tooltipText = !isConnected ? 'Offline - Reconnecting...' : '';

  return (
    <article 
      className={`task-card ${isUpdating ? 'updating' : ''}`}
      aria-labelledby={`task-title-${task.id}`}
      aria-describedby={`task-desc-${task.id}`}
    >
      <div className="task-header">
        <span className="task-id">#{task.id < 10 ? `00${task.id}` : `0${task.id}`}</span>
        <span className={`priority-tag priority-${task.priority}`}>
          {task.priority}
        </span>
      </div>

      <div>
        <h4 id={`task-title-${task.id}`} className="task-title">
          {task.title}
        </h4>
        <p id={`task-desc-${task.id}`} className="task-description">
          {task.description}
        </p>
      </div>

      <div className="task-meta">
        <span className="operator-info">
          <User size={12} aria-hidden="true" />
          <span>{task.operator}</span>
        </span>
        <span className="operator-info">
          <Clock size={12} aria-hidden="true" />
          <span>{task.timestamp}</span>
        </span>
      </div>

      {/* Action Buttons Container */}
      <div className="task-actions" role="group" aria-label={`Actions for ${task.title}`}>
        {task.status === 'PENDING' && (
          <>
            <div data-tooltip={tooltipText} style={{ flex: 1, display: 'flex' }}>
              <button
                type="button"
                className="btn-action btn-in-progress"
                disabled={!isConnected}
                onClick={() => handleAction('IN_PROGRESS')}
                aria-label={`Start processing task ${task.title}`}
                style={{ width: '100%' }}
              >
                <Play size={14} aria-hidden="true" />
                <span>Start</span>
              </button>
            </div>
            
            <div data-tooltip={tooltipText} style={{ flex: 1, display: 'flex' }}>
              <button
                type="button"
                className="btn-action btn-approve"
                disabled={!isConnected}
                onClick={() => handleAction('APPROVED')}
                aria-label={`Approve task ${task.title}`}
                style={{ width: '100%' }}
              >
                <CheckCircle2 size={14} aria-hidden="true" />
                <span>Approve</span>
              </button>
            </div>
          </>
        )}

        {task.status === 'IN_PROGRESS' && (
          <>
            <div data-tooltip={tooltipText} style={{ flex: 1, display: 'flex' }}>
              <button
                type="button"
                className="btn-action btn-approve"
                disabled={!isConnected}
                onClick={() => handleAction('APPROVED')}
                aria-label={`Approve task ${task.title}`}
                style={{ width: '100%' }}
              >
                <CheckCircle2 size={14} aria-hidden="true" />
                <span>Approve</span>
              </button>
            </div>

            <div data-tooltip={tooltipText} style={{ flex: 1, display: 'flex' }}>
              <button
                type="button"
                className="btn-action btn-reject"
                disabled={!isConnected}
                onClick={() => handleAction('REJECTED')}
                aria-label={`Reject task ${task.title}`}
                style={{ width: '100%' }}
              >
                <XCircle size={14} aria-hidden="true" />
                <span>Reject</span>
              </button>
            </div>
          </>
        )}

        {(task.status === 'APPROVED' || task.status === 'REJECTED') && (
          <div data-tooltip={tooltipText} style={{ flex: 1, display: 'flex' }}>
            <button
              type="button"
              className="btn-action btn-in-progress"
              disabled={!isConnected}
              onClick={() => handleAction('PENDING')}
              aria-label={`Re-open task ${task.title}`}
              style={{ width: '100%' }}
            >
              <span>Re-open Task</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
