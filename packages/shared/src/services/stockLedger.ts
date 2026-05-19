import type { AuditLog, StockItem, StockMovement } from '../types/domain';
import type { AuthenticatedActor } from '../types/rbac';
import { assertCan } from './rbac';

export interface StockMovementResult {
  item: StockItem;
  auditLog: AuditLog;
  belowThreshold: boolean;
}

export function applyStockMovement(
  item: StockItem,
  movement: StockMovement,
  actor: AuthenticatedActor,
  now: string
): StockMovementResult {
  assertCan(actor, 'stock:write');
  if (item.siteId !== movement.siteId) {
    throw new Error('Mouvement de stock hors site');
  }
  if (item.id !== movement.stockItemId) {
    throw new Error('Le mouvement ne correspond pas au stock');
  }
  if (movement.quantity <= 0) {
    throw new Error('La quantite de mouvement doit etre positive');
  }

  const nextQuantity =
    movement.direction === 'in'
      ? item.quantity + movement.quantity
      : movement.direction === 'out'
        ? item.quantity - movement.quantity
        : movement.quantity;

  if (nextQuantity < 0) {
    throw new Error('Stock insuffisant');
  }

  const updated: StockItem = {
    ...item,
    quantity: nextQuantity,
    updatedAt: now
  };

  return {
    item: updated,
    belowThreshold: updated.quantity <= updated.minQuantity,
    auditLog: {
      id: `${movement.id}:audit:stock`,
      siteId: item.siteId,
      actorId: actor.id,
      action: 'stock.move',
      entityType: 'stock_item',
      entityId: item.id,
      before: { quantity: item.quantity },
      after: { quantity: updated.quantity, movementId: movement.id },
      occurredAt: now,
      createdAt: now,
      updatedAt: now
    }
  };
}
