import type { Tank, TransferOrder } from '../src/types/domain';
import type { AuthenticatedActor } from '../src/types/rbac';
import { approveTransferOrder, executeTransferOrder, submitTransferOrder } from '../src/services/transferWorkflow';

const now = '2026-05-18T09:00:00.000Z';
const siteId = '11111111-1111-4111-8111-111111111111';
const otherSiteId = '22222222-2222-4222-8222-222222222222';

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
    currentVolumeLiters: 6000,
    status: 'occupied',
    material: 'inox',
    zone: 'Nord',
    position: { x: 24, y: 30 },
    sensors: [],
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

function order(overrides: Partial<TransferOrder> = {}): TransferOrder {
  return {
    id: '44444444-4444-4444-8444-444444444444',
    siteId,
    code: 'OT-2026-001',
    sourceTankId: '33333333-3333-4333-8333-333333333333',
    targetTankId: '55555555-5555-4555-8555-555555555555',
    lotId: '66666666-6666-4666-8666-666666666666',
    requestedVolumeLiters: 2500,
    status: 'draft',
    requestedBy: operator.id,
    requestedAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

describe('transfer workflow', () => {
  it('soumet un ordre de transfert brouillon', () => {
    const submitted = submitTransferOrder(order(), operator, now);
    expect(submitted.status).toBe('pending_approval');
    expect(submitted.requestedBy).toBe(operator.id);
  });

  it('refuse l approbation par un operateur sans permission', () => {
    expect(() => approveTransferOrder(order({ status: 'pending_approval' }), operator, now)).toThrow(
      'Permission refusee'
    );
  });

  it('refuse un transfert entre sites differents', () => {
    const approved = approveTransferOrder(order({ status: 'pending_approval' }), manager, now);
    expect(() =>
      executeTransferOrder(
        approved,
        tank(),
        tank({ id: '55555555-5555-4555-8555-555555555555', siteId: otherSiteId }),
        manager,
        now
      )
    ).toThrow('Operation impossible entre sites differents');
  });

  it('refuse une cible sans capacite suffisante', () => {
    const approved = approveTransferOrder(order({ status: 'pending_approval' }), manager, now);
    expect(() =>
      executeTransferOrder(
        approved,
        tank(),
        tank({
          id: '55555555-5555-4555-8555-555555555555',
          capacityLiters: 8000,
          currentVolumeLiters: 7000
        }),
        manager,
        now
      )
    ).toThrow('Capacite cible insuffisante');
  });

  it('execute un transfert et produit audit + evenement de tracabilite', () => {
    const approved = approveTransferOrder(order({ status: 'pending_approval' }), manager, now);
    const result = executeTransferOrder(
      approved,
      tank(),
      tank({ id: '55555555-5555-4555-8555-555555555555', currentVolumeLiters: 1000 }),
      manager,
      now
    );

    expect(result.order.status).toBe('completed');
    expect(result.sourceTank.currentVolumeLiters).toBe(3500);
    expect(result.targetTank.currentVolumeLiters).toBe(3500);
    expect(result.traceabilityEvents).toHaveLength(1);
    expect(result.auditLog.action).toBe('transfer.execute');
  });
});

