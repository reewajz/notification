// similar code from explorer-ng
export interface WorkflowStatus {
  uri: string; // workflow Definition URI!
  currentPhase: string; // A Phase Uri
  phases: {
    [phaseUri: string]: {
      taskStatus: {
        [taskUri: string]: {
          value: boolean;
        };
      };
    };
  };
  auditDelta: {
    intent: AuditIntent | undefined;
    currentValue: Partial<AuditDelta>;
    previousValue: Partial<AuditDelta>; // PreviousValue can be null in case of ADD
  };
}

export interface AuditDelta {
  currentPhaseTitle: string; // Store Phase Title
  taskStatus: {
    [taskUri: string]: {
      taskTitle: string;
      value: boolean | JSON;
    };
  };
  locked?: PhaseLock;
}

export enum AuditIntent {
  ADD = 'add',
  PHASE_CHANGE = 'phase_change',
  TASK_UPDATE = 'task_update',
  LOCKED_UPDATE = 'locked_update'
}

export enum PhaseLock {
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  PARKED = 'parked'
}
