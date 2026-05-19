import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'audit_logs',
  schema: entitySchemas.audit_logs,
  readPermission: 'audit:read',
  writePermission: 'audit:read'
});

