import type { Alert, AlertRule, EntityId } from '../types/domain';

export interface MetricSnapshot {
  siteId: EntityId;
  entityType: AlertRule['scope'];
  entityId: EntityId;
  metrics: Record<string, number | undefined>;
  measuredAt: string;
}

function compare(value: number, comparator: AlertRule['comparator'], threshold: number): boolean {
  switch (comparator) {
    case 'lt':
      return value < threshold;
    case 'lte':
      return value <= threshold;
    case 'gt':
      return value > threshold;
    case 'gte':
      return value >= threshold;
    case 'eq':
      return value === threshold;
  }
}

export function evaluateAlertRules(rules: AlertRule[], snapshot: MetricSnapshot): Alert[] {
  return rules
    .filter((rule) => rule.enabled && rule.siteId === snapshot.siteId && rule.scope === snapshot.entityType)
    .flatMap((rule) => {
      const value = snapshot.metrics[rule.metric];
      if (value === undefined || !compare(value, rule.comparator, rule.threshold)) {
        return [];
      }

      const severity: Alert['severity'] =
        rule.comparator === 'gt' || rule.comparator === 'gte'
          ? value > rule.threshold * 1.15
            ? 'critical'
            : 'warning'
          : value < rule.threshold * 0.85
            ? 'critical'
            : 'warning';

      return [
        {
          id: `${rule.id}:${snapshot.entityId}:${snapshot.measuredAt}`,
          siteId: snapshot.siteId,
          ruleId: rule.id,
          entityType: rule.scope,
          entityId: snapshot.entityId,
          severity,
          message: `${rule.name}: ${rule.metric}=${value}`,
          status: 'open',
          triggeredAt: snapshot.measuredAt,
          createdAt: snapshot.measuredAt,
          updatedAt: snapshot.measuredAt
        }
      ];
    });
}
