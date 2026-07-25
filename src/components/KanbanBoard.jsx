import React from 'react';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { Clock, Loader2, CheckCircle, AlertOctagon } from 'lucide-react';

export function KanbanBoard({ 
  tasks, 
  onStatusChange, 
  wsReadyState, 
  updatingTaskId,
  onResetTasks 
}) {
  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'APPROVED' || t.status === 'REJECTED');

  const allCompleted = tasks.length > 0 && pendingTasks.length === 0 && inProgressTasks.length === 0;

  return (
    <main className="kanban-grid" role="main" aria-label="Verification Pipeline Board">
      {/* Column 1: PENDING */}
      <section className="kanban-column" aria-labelledby="col-pending-title">
        <header className="column-header">
          <h2 id="col-pending-title" className="column-title" style={{ color: 'var(--accent-amber)' }}>
            <Clock size={18} aria-hidden="true" />
            <span>Pending Verification</span>
          </h2>
          <span className="column-count" aria-label={`${pendingTasks.length} pending tasks`}>
            {pendingTasks.length}
          </span>
        </header>

        {pendingTasks.length > 0 ? (
          <ul className="task-list" aria-label="List of pending verification tasks">
            {pendingTasks.map(task => (
              <li key={task.id}>
                <TaskCard
                  task={task}
                  onStatusChange={onStatusChange}
                  wsReadyState={wsReadyState}
                  updatingTaskId={updatingTaskId}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState 
            title={allCompleted ? "All caught up! 🎉" : "Queue Empty"}
            subtitle={allCompleted ? "Every verification ticket has been processed over WebSocket." : "No tasks currently waiting for initial verification."}
            onReset={allCompleted ? onResetTasks : null}
          />
        )}
      </section>

      {/* Column 2: IN PROGRESS */}
      <section className="kanban-column" aria-labelledby="col-progress-title">
        <header className="column-header">
          <h2 id="col-progress-title" className="column-title" style={{ color: 'var(--accent-blue)' }}>
            <Loader2 size={18} className="spinner" aria-hidden="true" />
            <span>In Review</span>
          </h2>
          <span className="column-count" aria-label={`${inProgressTasks.length} tasks in review`}>
            {inProgressTasks.length}
          </span>
        </header>

        {inProgressTasks.length > 0 ? (
          <ul className="task-list" aria-label="List of tasks currently under review">
            {inProgressTasks.map(task => (
              <li key={task.id}>
                <TaskCard
                  task={task}
                  onStatusChange={onStatusChange}
                  wsReadyState={wsReadyState}
                  updatingTaskId={updatingTaskId}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState 
            title="No Active Reviews" 
            subtitle="Move pending items into review when field operators begin inspection."
          />
        )}
      </section>

      {/* Column 3: COMPLETED */}
      <section className="kanban-column" aria-labelledby="col-completed-title">
        <header className="column-header">
          <h2 id="col-completed-title" className="column-title" style={{ color: 'var(--accent-emerald)' }}>
            <CheckCircle size={18} aria-hidden="true" />
            <span>Completed</span>
          </h2>
          <span className="column-count" aria-label={`${completedTasks.length} completed tasks`}>
            {completedTasks.length}
          </span>
        </header>

        {completedTasks.length > 0 ? (
          <ul className="task-list" aria-label="List of completed verification tasks">
            {completedTasks.map(task => (
              <li key={task.id}>
                <TaskCard
                  task={task}
                  onStatusChange={onStatusChange}
                  wsReadyState={wsReadyState}
                  updatingTaskId={updatingTaskId}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState 
            title="No History Yet" 
            subtitle="Approved and rejected field tickets will appear here instantaneously."
          />
        )}
      </section>
    </main>
  );
}
