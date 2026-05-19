import type { TraceabilityEvent } from '../src/types/domain';
import { searchTraceability } from '../src/services/traceability';

const base = {
  siteId: '11111111-1111-4111-8111-111111111111',
  type: 'transfer_executed' as const,
  occurredAt: '2026-05-18T09:00:00.000Z',
  actorId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  createdAt: '2026-05-18T09:00:00.000Z',
  updatedAt: '2026-05-18T09:00:00.000Z'
};

const events: TraceabilityEvent[] = [
  {
    ...base,
    id: 'event-1',
    sourceEntityType: 'lot',
    sourceEntityId: 'lot-a',
    targetEntityType: 'tank',
    targetEntityId: 'tank-1',
    quantityLiters: 5000
  },
  {
    ...base,
    id: 'event-2',
    sourceEntityType: 'tank',
    sourceEntityId: 'tank-1',
    targetEntityType: 'tank',
    targetEntityId: 'tank-2',
    quantityLiters: 2200
  }
];

describe('traceability search', () => {
  it('retrouve la descendance d un lot', () => {
    const graph = searchTraceability(events, { entityType: 'lot', entityId: 'lot-a' }, 'downstream');
    expect(graph.nodes.map((node) => `${node.entityType}:${node.entityId}`)).toEqual([
      'lot:lot-a',
      'tank:tank-1',
      'tank:tank-2'
    ]);
    expect(graph.edges).toHaveLength(2);
  });

  it('retrouve l ascendance d une cuve cible', () => {
    const graph = searchTraceability(events, { entityType: 'tank', entityId: 'tank-2' }, 'upstream');
    expect(graph.nodes.map((node) => `${node.entityType}:${node.entityId}`)).toEqual([
      'lot:lot-a',
      'tank:tank-1',
      'tank:tank-2'
    ]);
  });
});

