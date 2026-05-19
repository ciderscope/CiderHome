export const ROLES = [
  'admin',
  'cellar_manager',
  'operator',
  'quality_technician'
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  cellar_manager: 'Responsable Cuverie',
  operator: 'Operateur',
  quality_technician: 'Technicien Qualite'
};

export const PERMISSIONS = [
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
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export interface AuthenticatedActor {
  id: string;
  email: string;
  role: Role;
  siteIds: string[];
}
