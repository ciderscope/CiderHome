import type { AlertRule, Operation, StockItem, StockMovement, Tank } from '../src/types/domain';
import type { AuthenticatedActor } from '../src/types/rbac';
import { evaluateAlertRules } from '../src/services/alertRules';
import { suggestTankForHarvest } from '../src/services/harvestAssignment';
import { submitOperation, validateOperation } from '../src/services/operationWorkflow';
import { applyStockMovement } from '../src/services/stockLedger';
import { validateTankBusinessRules } from '../src/services/tankValidation';

const now = '2026-05-18T09:00:00.000Z';
const siteId = '11111111-1111-4111-8111-111111111111';

const manager: AuthenticatedActor = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  email: 'manager@example.test',
  role: 'cellar_manager',
  siteIds: [siteId]
};

const operator: AuthenticatedActor = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  email: 'operator@example.test',
  role: 'operator',
  siteIds: [siteId]
};

function tank(overrides: Partial<Tank> = {}): Tank {
  return {
    id: '33333333-3333-4333-8333-333333333333',
    siteId,
    code: 'C-01',
    name: 'Cuve C-01',
    capacityLiters: 10000,
    usefulCapacityLiters: 9500,
    currentVolumeLiters: 0,
    status: 'available',
    state: 'vide',
    material: 'inox',
    zone: 'Nord',
    position: { x: 10, y: 20 },
    sensors: [],
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

function operation(overrides: Partial<Operation> = {}): Operation {
  return {
    id: '44444444-4444-4444-8444-444444444444',
    siteId,
    type: 'prise_densite_temperature',
    status: 'draft',
    lotId: '66666666-6666-4666-8666-666666666666',
    tankId: '33333333-3333-4333-8333-333333333333',
    operatorId: operator.id,
    startedAt: now,
    checklist: [{ id: 'density', label: 'Densite saisie', required: true, checked: true }],
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

describe('viticole workflow services', () => {
  it('signale une cuve vide avec volume positif', () => {
    const issues = validateTankBusinessRules(tank({ currentVolumeLiters: 1200 }));
    expect(issues.map((issue) => issue.field)).toContain('state');
  });

  it('propose la plus petite cuve disponible suffisante pour une reception', () => {
    const proposal = suggestTankForHarvest(
      [tank({ id: '1', capacityLiters: 12000, usefulCapacityLiters: 11000 }), tank({ id: '2', capacityLiters: 6000, usefulCapacityLiters: 5600 })],
      { weightKg: 7000 }
    );
    expect(proposal?.tank.id).toBe('2');
  });

  it('refuse une operation avec checklist obligatoire incomplete', () => {
    expect(() =>
      submitOperation(
        operation({ checklist: [{ id: 'density', label: 'Densite saisie', required: true, checked: false }] }),
        operator,
        now
      )
    ).toThrow('Checklist incomplete');
  });

  it('valide une operation soumise par une personne distincte', () => {
    const submitted = submitOperation(operation(), operator, now).operation;
    const validated = validateOperation(submitted, manager, now).operation;
    expect(validated.status).toBe('validated');
    expect(validated.validatedBy).toBe(manager.id);
  });

  it('applique une sortie de stock et detecte le seuil bas', () => {
    const item: StockItem = {
      id: '55555555-5555-4555-8555-555555555555',
      siteId,
      name: 'SO2 solution',
      category: 'sulfite',
      batchNumber: 'SO2-01',
      quantity: 6,
      unit: 'l',
      minQuantity: 4,
      location: 'Armoire',
      createdAt: now,
      updatedAt: now
    };
    const movement: StockMovement = {
      id: '77777777-7777-4777-8777-777777777777',
      siteId,
      stockItemId: item.id,
      direction: 'out',
      quantity: 2,
      unit: 'l',
      reason: 'Ajout en cuve',
      movedAt: now,
      actorId: manager.id,
      createdAt: now,
      updatedAt: now
    };

    const result = applyStockMovement(item, movement, manager, now);
    expect(result.item.quantity).toBe(4);
    expect(result.belowThreshold).toBe(true);
  });

  it('genere une alerte sur seuil capteur', () => {
    const rule: AlertRule = {
      id: '88888888-8888-4888-8888-888888888888',
      siteId,
      name: 'Temperature haute',
      scope: 'tank',
      metric: 'temperatureC',
      comparator: 'gt',
      threshold: 18,
      enabled: true,
      channels: ['email'],
      createdAt: now,
      updatedAt: now
    };

    const alerts = evaluateAlertRules([rule], {
      siteId,
      entityType: 'tank',
      entityId: '33333333-3333-4333-8333-333333333333',
      metrics: { temperatureC: 22 },
      measuredAt: now
    });

    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.severity).toBe('critical');
  });
});
