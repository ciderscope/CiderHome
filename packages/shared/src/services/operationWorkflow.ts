import type { AuditLog, Operation, TraceabilityEvent } from '../types/domain';
import type { AuthenticatedActor } from '../types/rbac';
import { assertCan } from './rbac';

export interface OperationWorkflowResult {
  operation: Operation;
  auditLog: AuditLog;
  traceabilityEvent?: TraceabilityEvent;
}

function audit(operation: Operation, actor: AuthenticatedActor, action: string, now: string, beforeStatus?: string): AuditLog {
  return {
    id: `${operation.id}:audit:${action}:${now}`,
    siteId: operation.siteId,
    actorId: actor.id,
    action,
    entityType: 'operation',
    entityId: operation.id,
    before: beforeStatus ? { status: beforeStatus } : undefined,
    after: { status: operation.status },
    occurredAt: now,
    createdAt: now,
    updatedAt: now
  };
}

export function submitOperation(operation: Operation, actor: AuthenticatedActor, now: string): OperationWorkflowResult {
  assertCan(actor, 'operation:write');
  if ((operation.status ?? 'draft') !== 'draft') {
    throw new Error('Seule une operation brouillon peut etre soumise');
  }

  const missing = (operation.checklist ?? []).filter((item) => item.required && !item.checked);
  if (missing.length > 0) {
    throw new Error(`Checklist incomplete: ${missing.map((item) => item.label).join(', ')}`);
  }

  const submitted: Operation = {
    ...operation,
    status: 'submitted',
    operatorId: actor.id,
    updatedAt: now
  };

  return {
    operation: submitted,
    auditLog: audit(submitted, actor, 'operation.submit', now, operation.status ?? 'draft')
  };
}

export function validateOperation(operation: Operation, actor: AuthenticatedActor, now: string): OperationWorkflowResult {
  assertCan(actor, 'operation:validate');
  if (operation.status !== 'submitted') {
    throw new Error('Seule une operation soumise peut etre validee');
  }
  if (operation.operatorId === actor.id && actor.role !== 'admin') {
    throw new Error('La validation doit etre faite par une personne distincte');
  }

  const validated: Operation = {
    ...operation,
    status: 'validated',
    validatedBy: actor.id,
    validatedAt: now,
    updatedAt: now
  };

  return {
    operation: validated,
    auditLog: audit(validated, actor, 'operation.validate', now, operation.status)
  };
}

export function executeOperation(operation: Operation, actor: AuthenticatedActor, now: string): OperationWorkflowResult {
  assertCan(actor, 'operation:write');
  if (operation.status !== 'validated') {
    throw new Error('Une operation doit etre validee avant execution');
  }

  const executed: Operation = {
    ...operation,
    status: 'executed',
    endedAt: operation.endedAt ?? now,
    updatedAt: now
  };

  const traceabilityEvent: TraceabilityEvent | undefined =
    operation.lotId && operation.tankId
      ? {
          id: `${operation.id}:trace:operation`,
          siteId: operation.siteId,
          type: 'operation_recorded',
          lotId: operation.lotId,
          subLotId: operation.subLotId,
          sourceEntityType: 'operation',
          sourceEntityId: operation.id,
          targetEntityType: 'tank',
          targetEntityId: operation.tankId,
          quantityLiters: operation.volumeDeltaLiters,
          occurredAt: now,
          actorId: actor.id,
          metadata: { operationType: operation.type },
          createdAt: now,
          updatedAt: now
        }
      : undefined;

  return {
    operation: executed,
    auditLog: audit(executed, actor, 'operation.execute', now, operation.status),
    traceabilityEvent
  };
}
