import type { AuthenticatedActor, Permission, Role } from '../types/rbac';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'user:manage',
    'site:read',
    'site:manage',
    'tank:read',
    'tank:write',
    'lot:read',
    'lot:write',
    'harvest:read',
    'harvest:write',
    'operation:read',
    'operation:write',
    'operation:validate',
    'analysis:read',
    'analysis:write',
    'stock:read',
    'stock:write',
    'transfer:read',
    'transfer:create',
    'transfer:approve',
    'transfer:execute',
    'traceability:read',
    'alert:read',
    'alert:manage',
    'document:read',
    'document:write',
    'report:read',
    'sensor:ingest',
    'export:csv',
    'audit:read'
  ],
  cellar_manager: [
    'site:read',
    'tank:read',
    'tank:write',
    'lot:read',
    'lot:write',
    'harvest:read',
    'harvest:write',
    'operation:read',
    'operation:write',
    'operation:validate',
    'analysis:read',
    'stock:read',
    'stock:write',
    'transfer:read',
    'transfer:create',
    'transfer:approve',
    'transfer:execute',
    'traceability:read',
    'alert:read',
    'alert:manage',
    'document:read',
    'document:write',
    'report:read',
    'export:csv',
    'audit:read'
  ],
  operator: [
    'site:read',
    'tank:read',
    'lot:read',
    'harvest:read',
    'harvest:write',
    'operation:read',
    'operation:write',
    'transfer:read',
    'transfer:create',
    'transfer:execute',
    'traceability:read',
    'alert:read',
    'stock:read',
    'document:read'
  ],
  quality_technician: [
    'site:read',
    'tank:read',
    'lot:read',
    'harvest:read',
    'analysis:read',
    'analysis:write',
    'traceability:read',
    'alert:read',
    'report:read',
    'document:read',
    'export:csv'
  ]
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function assertCan(actor: AuthenticatedActor, permission: Permission): void {
  if (!can(actor.role, permission)) {
    throw new Error(`Permission refusee: ${permission}`);
  }
}

export function canAccessSite(actor: AuthenticatedActor, siteId: string): boolean {
  return actor.role === 'admin' || actor.siteIds.includes(siteId);
}

export function assertCanAccessSite(actor: AuthenticatedActor, siteId: string): void {
  if (!canAccessSite(actor, siteId)) {
    throw new Error(`Site hors perimetre: ${siteId}`);
  }
}
