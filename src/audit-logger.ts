import * as fs from 'fs';
import * as path from 'path';

export interface AuditEvent {
  timestamp: string;
  operation: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failure';
  details?: any;
  error?: string;
}

export class AuditLogger {
  private logFile: string;

  constructor(logDir: string = './logs') {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Create log file with date
    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(logDir, `audit-${date}.json`);
  }

  log(event: Omit<AuditEvent, 'timestamp'>) {
    const auditEvent: AuditEvent = {
      timestamp: new Date().toISOString(),
      ...event,
    };

    // Log to console
    const emoji = event.status === 'success' ? '✓' : '✗';
    console.log(`${emoji} [AUDIT] ${event.operation} ${event.resource}${event.resourceId ? `/${event.resourceId}` : ''}`);

    // Append to file
    const logEntry = JSON.stringify(auditEvent) + '\n';
    fs.appendFileSync(this.logFile, logEntry);

    return auditEvent;
  }

  logSuccess(operation: string, resource: string, resourceId?: string, details?: any) {
    return this.log({
      operation,
      resource,
      resourceId,
      status: 'success',
      details,
    });
  }

  logFailure(operation: string, resource: string, error: string, resourceId?: string) {
    return this.log({
      operation,
      resource,
      resourceId,
      status: 'failure',
      error,
    });
  }
}