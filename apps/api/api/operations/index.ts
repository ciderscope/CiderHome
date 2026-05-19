import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'operations',
  schema: entitySchemas.operations,
  readPermission: 'operation:read',
  writePermission: 'operation:write'
});

