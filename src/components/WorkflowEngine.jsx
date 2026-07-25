import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './Header';
import { KanbanBoard } from './KanbanBoard';
import { TelemetryLogModal } from './TelemetryLogModal';
import { WebSocketManager } from '../services/websocketManager';
import { AlertTriangle, WifiOff, CheckCircle2 } from 'lucide-react';

const INITIAL_TASKS = [
  { 
    id: 1, 
    title: 'Biometric Identifier Handshake', 
    description: 'Verify field operator biometric hash against central registry', 
    status: 'PENDING',
    priority: 'P0',
    operator: 'Ramesh K. (Terminal A)',
    timestamp: '10:42:15 AM'
  },
  { 
    id: 2, 
    title: 'Container Hazmat Clearance #8902', 
    description: 'Validate environmental safety certificate for cargo bay 4', 
    status: 'PENDING',
    priority: 'P0',
    operator: 'Suresh V. (Gate 3)',
    timestamp: '10:44:02 AM'
  },
  { 
    id: 3, 
    title: 'High-Value Manifest Audit', 
    description: 'Reconcile digital inventory with physical bill of lading', 
    status: 'PENDING',
    priority: 'P1',
    operator: 'Anita M. (Vault B)',
    timestamp: '10:45:30 AM'
  },
  { 
    id: 4, 
    title: 'Thermal Camera Sensor Calibration', 
    description: 'Execute automated remote diagnostic on perimeter camera 12', 
    status: 'IN_PROGRESS',
    priority: 'P1',
    operator: 'Piyush Seth (Control)',
    timestamp: '10:30:00 AM'
  },
  { 
    id: 5, 
    title: 'Operator Security Clearance Renewal', 
    description: 'Level 3 access badge authorization check', 
    status: 'APPROVED',
    priority: 'P2',
    operator: 'Deepika K. (HQ)',
    timestamp: '09:15:22 AM'
  }
];

export function WorkflowEngine() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [connectionStatus, setConnectionStatus] = useState({
    state: 'CONNECTING',
    message: 'Initializing WebSocket...',
    readyState: WebSocket.CONNECTING,
    isMock: false
  });
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const wsManagerRef = useRef(null);

  // Add Log Helper
  const addLog = useCallback((type, payload) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [
      { type, payload, time },
      ...prev.slice(0, 99) // Keep last 100 entries
    ]);
  }, []);

  // Show temporary toast notification
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Initialize WebSocket with Cleanup
  useEffect(() => {
    // Phase 1: Initialize WebSocket instance
    const wsManager = new WebSocketManager('wss://echo.websocket.events', {
      initialBackoffMs: 1000,
      maxBackoffMs: 16000,
      backoffFactor: 2
    });
    wsManagerRef.current = wsManager;

    // Listener for Connection Status Changes
    wsManager.on('statusChange', (statusInfo) => {
      setConnectionStatus(statusInfo);
      addLog('SYSTEM', `Socket State -> ${statusInfo.state}: ${statusInfo.message}`);
    });

    // Phase 2: Event Listener for incoming WebSocket messages
    wsManager.on('message', (event) => {
      try {
        const payload = JSON.parse(event.data);
        addLog('RECEIVED', payload);

        // Filter and process STATUS_UPDATE events
        if (payload && payload.type === 'STATUS_UPDATE') {
          const { taskId, newStatus } = payload;

          // CRITICAL CONSTRAINT: Functional State Update Pattern to avoid stale closures
          setTasks(prevTasks => {
            return prevTasks.map(task => {
              if (task.id === taskId) {
                return { 
                  ...task, 
                  status: newStatus,
                  timestamp: new Date().toLocaleTimeString()
                };
              }
              return task;
            });
          });

          // Telemetry Simulation Requirement
          console.log('[Analytics] Task status mutated via WebSocket', payload);
          addLog('ANALYTICS', `[Analytics] Task status mutated via WebSocket -> Task #${taskId} to ${newStatus}`);

          showToast(`Task #${taskId} state updated to ${newStatus} via WebSocket broadcast!`);
          setUpdatingTaskId(null);
        }
      } catch (err) {
        // Echo server may echo raw ping strings or greetings, handle non-JSON frames gracefully
        addLog('RECEIVED', `Raw string message: ${event.data}`);
      }
    });

    wsManager.on('error', (err) => {
      addLog('SYSTEM', 'WebSocket connection error encountered.');
    });

    // Connect to WebSocket endpoint
    wsManager.connect();

    // CLEANUP FUNCTION: Unmount teardown to prevent memory leaks
    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
      }
    };
  }, [addLog, showToast]);

  // Phase 2: Action Dispatching over WebSocket
  const handleStatusChange = useCallback((taskId, newStatus) => {
    if (!wsManagerRef.current || wsManagerRef.current.readyState !== WebSocket.OPEN) {
      showToast('Cannot dispatch state change: WebSocket connection is disconnected.');
      return;
    }

    setUpdatingTaskId(taskId);
    
    // Construct required payload structure
    const payload = {
      type: 'STATUS_UPDATE',
      taskId: taskId,
      newStatus: newStatus,
      timestamp: new Date().toISOString(),
      operator: 'Piyush Seth [PDIT-INT-1153]'
    };

    addLog('SENT', payload);

    // Send JSON payload over WebSocket connection
    const success = wsManagerRef.current.send(payload);
    if (!success) {
      setUpdatingTaskId(null);
      showToast('Failed to dispatch payload over socket.');
    }
  }, [addLog, showToast]);

  // Toggle simulated network offline state
  const handleToggleOffline = () => {
    const nextState = !isOfflineSimulated;
    setIsOfflineSimulated(nextState);
    if (wsManagerRef.current) {
      wsManagerRef.current.toggleSimulatedOffline(nextState);
    }
    showToast(nextState ? 'Network disconnected (Offline mode active)' : 'Re-establishing network socket connection...');
  };

  // Reset tasks to original sample dataset
  const handleResetTasks = () => {
    setTasks(INITIAL_TASKS);
    showToast('Task pipeline reset to initial state.');
  };

  return (
    <div className="app-container">
      <Header 
        connectionStatus={connectionStatus}
        isOfflineSimulated={isOfflineSimulated}
        onToggleOffline={handleToggleOffline}
        onOpenLogs={() => setIsLogModalOpen(true)}
        onResetTasks={handleResetTasks}
        logCount={logs.length}
      />

      <div className="main-content">
        {/* Offline / Connection Warning Banner */}
        {connectionStatus.state !== 'OPEN' && (
          <div className="notice-banner" role="alert">
            <div className="notice-content">
              <WifiOff size={20} style={{ color: 'var(--accent-amber)', marginTop: '2px' }} />
              <div className="notice-text">
                <h3>
                  {connectionStatus.state === 'CONNECTING' ? 'WebSocket Connection Re-establishing...' : 'WebSocket Disconnected'}
                </h3>
                <p>
                  {connectionStatus.message}. Field operator action buttons are temporarily locked to prevent out-of-sync state mutations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Live Toast Notification */}
        {toastMessage && (
          <div 
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--accent-blue)',
              color: 'var(--text-primary)',
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 90,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeIn 0.2s ease-in-out'
            }}
            role="status"
          >
            <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toastMessage}</span>
          </div>
        )}

        {/* Core Kanban Board Component */}
        <KanbanBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          wsReadyState={connectionStatus.readyState}
          updatingTaskId={updatingTaskId}
          onResetTasks={handleResetTasks}
        />
      </div>

      <TelemetryLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        logs={logs}
        onClear={() => setLogs([])}
      />

      <footer className="site-footer" role="contentinfo">
        <p>
          Ticket ID: ENG-149206 • Core Infrastructure Overhaul & Real-Time Sync • Assigned To: Piyush Seth [PDIT-INT-1153]
        </p>
      </footer>
    </div>
  );
}
