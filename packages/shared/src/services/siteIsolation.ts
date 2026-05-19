import type { AuthenticatedActor } from '../types/rbac';
import { assertCanAccessSite } from './rbac';

export interface SiteScopedInput {
  siteId: string;
}

export function assertSameSite(...entities: SiteScopedInput[]): string {
  const [first] = entities;
  if (!first) {
    throw new Error('Au moins une entite site-scopee est requise');
  }

  for (const entity of entities) {
    if (entity.siteId !== first.siteId) {
      throw new Error('Operation impossible entre sites differents');
    }
  }

  return first.siteId;
}

export function assertActorCanUseEntities(actor: AuthenticatedActor, ...entities: SiteScopedInput[]): string {
  const siteId = assertSameSite(...entities);
  assertCanAccessSite(actor, siteId);
  return siteId;
}
