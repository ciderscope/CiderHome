import type { AuditLog, Tank, TraceabilityEvent, TransferOrder } from '../types/domain';
import type { AuthenticatedActor } from '../types/rbac';
import { assertCan } from './rbac';
import { assertActorCanUseEntities } from './siteIsolation';

export interface TransferExecutionResult {
  order: TransferOrder;
  sourceTank: Tank;
  targetTank: Tank;
  traceabilityEvents: TraceabilityEvent[];
  auditLog: AuditLog;
}

export function submitTransferOrder(order: TransferOrder, actor: AuthenticatedActor, now: string): TransferOrder {
  assertCan(actor, 'transfer:create');
  if (order.status !== 'draft') {
    throw new Error('Seul un ordre brouillon peut etre soumis');
  }

  return {
    ...order,
    status: 'pending_approval',
    requestedBy: actor.id,
    requestedAt: now,
    updatedAt: now
  };
}

export function approveTransferOrder(order: TransferOrder, actor: AuthenticatedActor, now: string): TransferOrder {
  assertCan(actor, 'transfer:approve');
  if (order.status !== 'pending_approval') {
    throw new Error('Seul un ordre en attente peut etre approuve');
  }
  if (order.requestedBy === actor.id && actor.role !== 'admin') {
    throw new Error('Un ordre doit etre approuve par une personne distincte');
  }

  return {
    ...order,
    status: 'approved',
    approvedBy: actor.id,
    approvedAt: now,
    updatedAt: now
  };
}

export function executeTransferOrder(
  order: TransferOrder,
  sourceTank: Tank,
  targetTank: Tank,
  actor: AuthenticatedActor,
  now: string
): TransferExecutionResult {
  assertCan(actor, 'transfer:execute');
  const siteId = assertActorCanUseEntities(actor, order, sourceTank, targetTank);

  if (order.status !== 'approved') {
    throw new Error('Ordre non approuve');
  }
  if (order.sourceTankId !== sourceTank.id || order.targetTankId !== targetTank.id) {
    throw new Error('Les cuves ne correspondent pas a l ordre');
  }
  if (sourceTank.currentVolumeLiters < order.requestedVolumeLiters) {
    throw new Error('Volume source insuffisant');
  }

  const targetAvailableVolume = targetTank.capacityLiters - targetTank.currentVolumeLiters;
  if (targetAvailableVolume < order.requestedVolumeLiters) {
    throw new Error('Capacite cible insuffisante');
  }

  const updatedSource: Tank = {
    ...sourceTank,
    currentVolumeLiters: sourceTank.currentVolumeLiters - order.requestedVolumeLiters,
    status: sourceTank.currentVolumeLiters - order.requestedVolumeLiters > 0 ? 'occupied' : 'available',
    updatedAt: now
  };

  const updatedTarget: Tank = {
    ...targetTank,
    currentVolumeLiters: targetTank.currentVolumeLiters + order.requestedVolumeLiters,
    contentLotId: order.lotId,
    status: 'occupied',
    updatedAt: now
  };

  const completedOrder: TransferOrder = {
    ...order,
    status: 'completed',
    executedBy: actor.id,
    executedAt: now,
    updatedAt: now
  };

  const traceabilityEvents: TraceabilityEvent[] = [
    {
      id: `${order.id}:trace:source`,
      siteId,
      type: 'transfer_executed',
      lotId: order.lotId,
      subLotId: order.subLotId,
      sourceEntityType: 'tank',
      sourceEntityId: sourceTank.id,
      targetEntityType: 'tank',
      targetEntityId: targetTank.id,
      quantityLiters: order.requestedVolumeLiters,
      occurredAt: now,
      actorId: actor.id,
      metadata: { transferOrderId: order.id },
      createdAt: now,
      updatedAt: now
    }
  ];

  const auditLog: AuditLog = {
    id: `${order.id}:audit:execute`,
    siteId,
    actorId: actor.id,
    action: 'transfer.execute',
    entityType: 'transfer_order',
    entityId: order.id,
    before: { status: order.status },
    after: { status: completedOrder.status },
    occurredAt: now,
    createdAt: now,
    updatedAt: now
  };

  return {
    order: completedOrder,
    sourceTank: updatedSource,
    targetTank: updatedTarget,
    traceabilityEvents,
    auditLog
  };
}
