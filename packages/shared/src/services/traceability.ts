import type { TraceabilityDirection, TraceabilityEvent } from '../types/domain';

export interface TraceabilityNode {
  entityType: string;
  entityId: string;
  label: string;
}

export interface TraceabilityEdge {
  from: string;
  to: string;
  eventId: string;
  quantityLiters?: number;
}

export interface TraceabilityGraph {
  nodes: TraceabilityNode[];
  edges: TraceabilityEdge[];
}

function nodeKey(entityType: string, entityId: string): string {
  return `${entityType}:${entityId}`;
}

export function buildTraceabilityGraph(events: TraceabilityEvent[]): TraceabilityGraph {
  const nodes = new Map<string, TraceabilityNode>();
  const edges: TraceabilityEdge[] = [];

  for (const event of events) {
    if (!event.sourceEntityType || !event.sourceEntityId || !event.targetEntityType || !event.targetEntityId) {
      continue;
    }

    const from = nodeKey(event.sourceEntityType, event.sourceEntityId);
    const to = nodeKey(event.targetEntityType, event.targetEntityId);

    nodes.set(from, {
      entityType: event.sourceEntityType,
      entityId: event.sourceEntityId,
      label: from
    });
    nodes.set(to, {
      entityType: event.targetEntityType,
      entityId: event.targetEntityId,
      label: to
    });
    edges.push({ from, to, eventId: event.id, quantityLiters: event.quantityLiters });
  }

  return { nodes: [...nodes.values()], edges };
}

export function searchTraceability(
  events: TraceabilityEvent[],
  start: { entityType: string; entityId: string },
  direction: TraceabilityDirection
): TraceabilityGraph {
  const graph = buildTraceabilityGraph(events);
  const startKey = nodeKey(start.entityType, start.entityId);
  const visited = new Set<string>([startKey]);
  const queue = [startKey];
  const keptEdges: TraceabilityEdge[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    const nextEdges = graph.edges.filter((edge) =>
      direction === 'downstream' ? edge.from === current : edge.to === current
    );

    for (const edge of nextEdges) {
      const next = direction === 'downstream' ? edge.to : edge.from;
      keptEdges.push(edge);
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return {
    nodes: graph.nodes.filter((node) => visited.has(nodeKey(node.entityType, node.entityId))),
    edges: keptEdges
  };
}
