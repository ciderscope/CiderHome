import type { Permission, Role } from "@cuverie/shared";
import { can } from "@cuverie/shared";

export const hasPermission = (role: Role | undefined, permission: Permission): boolean => {
  if (!role) return false;
  return can(role, permission);
};

